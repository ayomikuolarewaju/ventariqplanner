// app/api/webhooks/stripe/route.ts
//
// npm install stripe resend
//
// After deploying, create the webhook endpoint in the Stripe Dashboard
// pointing at https://yourdomain.com/api/webhooks/stripe, subscribed to
// checkout.session.completed. Copy the signing secret into
// STRIPE_WEBHOOK_SECRET.
//
// Uses the service-role client throughout -- this route has no user
// session (Stripe calls it directly), and needs to bypass RLS to write
// orders/customers.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { CityGuideDocument } from "@/lib/pdf/CityGuideDocument";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as any;
  const supabase = createAdminClient();

  try {
    // idempotency: Stripe retries webhooks, never process the same
    // session twice
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, fulfillment_status")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // find-or-create customer, matched by email -- NOT the same as the
    // Supabase Auth user id, per the real customers table shape
    const email = session.customer_details?.email ?? session.customer_email;
    if (!email) throw new Error("Checkout session has no customer email");

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    let customer = existingCustomer;
    if (!customer) {
      const { data: created, error: customerError } = await supabase
        .from("customers")
        .insert({
          email,
          full_name: session.customer_details?.name ?? null,
          phone: session.customer_details?.phone ?? null,
          stripe_customer_id: session.customer ?? null,
        })
        .select("*")
        .single();
      if (customerError) throw customerError;
      customer = created;
    }

    const metadata = session.metadata ?? {};
    const kind = metadata.kind as "plan" | "location_guide";
    const sku = metadata.sku as string;

    const fulfillmentStatus = kind === "plan" ? "awaiting_intake" : "processing";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        product_sku: sku,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        payment_status: session.payment_status ?? "paid",
        fulfillment_status: fulfillmentStatus,
        event_slug: metadata.event_slug || null,
        location_slug: kind === "location_guide" ? metadata.location_slug || null : null,
      })
      .select("*")
      .single();

    if (orderError) throw orderError;

    if (kind === "location_guide") {
      await deliverLocationGuide(supabase, {
        order,
        customer,
        eventSlug: metadata.event_slug,
        locationSlug: metadata.location_slug,
      });
    } else if (kind === "plan") {
      await sendIntakeEmail({ order, customer, sku });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json(
      { error: "Webhook processing failed", detail: err.message },
      { status: 500 }
    );
  }
}

async function deliverLocationGuide(
  supabase: ReturnType<typeof createAdminClient>,
  {
    order,
    customer,
    eventSlug,
    locationSlug,
  }: { order: any; customer: any; eventSlug: string; locationSlug: string }
) {
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", eventSlug)
    .single();

  const { data: location } = await supabase
    .from("event_locations")
    .select("*")
    .eq("event_id", event.id)
    .eq("slug", locationSlug)
    .single();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, location_services(name, description)")
    .eq("location_id", location.id);

  const services = (categories ?? []).flatMap((cat: any) =>
    (cat.location_services ?? []).map((s: any) => ({
      category: cat.name,
      name: s.name,
      description: s.description,
    }))
  );

  const pdfBuffer = await renderToBuffer(
    <CityGuideDocument
      eyebrow={event.eyebrow}
      cityName={location.name}
      tagline={location.description}
      heroImage={location.image}
      services={services}
    />
  );

  // store it -- keyed by order id, since checkout is guest-only now and
  // there's no auth user id to key it by. This is what lets the
  // checkout-success page offer a direct download link.
  const storagePath = `${eventSlug}/${locationSlug}/${order.id}.pdf`;
  await supabase.storage.from("guides").upload(storagePath, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "ComfortLifeUS <info@mail.comfortlifeus.com>",
    to: customer.email,
    subject: `Your ${location.name} Guide Is Ready`,
    html: `<p>Hello ${customer.full_name ?? ""},</p><p>Thank you for your purchase. Your ${location.name} guide is attached to this email.</p><p>Best regards,<br/>ComfortLifeUS</p>`,
    attachments: [
      { filename: `${location.slug}-guide.pdf`, content: pdfBuffer.toString("base64") },
    ],
  });

  await supabase
    .from("orders")
    .update({ fulfillment_status: "delivered" })
    .eq("id", order.id);
}

async function sendIntakeEmail({
  order,
  customer,
  sku,
}: {
  order: any;
  customer: any;
  sku: string;
}) {
  const base = process.env.WEBSITE_URL || "https://comfortlifeus.com";
  const url = `${base}/intake?order_id=${order.id}&product_sku=${encodeURIComponent(sku)}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "ComfortLifeUS <info@mail.comfortlifeus.com>",
    to: customer.email,
    subject: "Please Complete Your ComfortLifeUS Travel Intake Form",
    html: `<p>Hello ${customer.full_name ?? ""},</p><p>Thank you for your purchase. Your selected plan requires a few trip details before we can prepare your personalized plan.</p><p><a href="${url}">Complete your intake form here</a></p><p>Best regards,<br/>ComfortLifeUS</p>`,
  });
}
