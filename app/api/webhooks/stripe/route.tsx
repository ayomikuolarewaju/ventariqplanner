// app/api/webhooks/stripe/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

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
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

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
          country_of_origin: session.customer_details?.address?.country ?? null,
        })
        .select("*")
        .single();
      if (customerError) throw customerError;
      customer = created;
    }

    const metadata = session.metadata ?? {};
    const kind = metadata.kind as "plan" | "location_guide";
    const sku = metadata.sku as string;

    // Look up the plan's real delivery config -- this is the source of
    // truth, not the Stripe metadata, since it can be edited in admin
    // without needing a new checkout session to pick up changes.
    let deliveryType: "instant_download" | "personalized" = "personalized";
    let assetProductSku: string | null = null;
    let assetCitySlug: string | null = null;

    if (kind === "plan") {
      const { data: plan } = await supabase
        .from("plans")
        .select("delivery_type, asset_product_sku, asset_city_slug")
        .eq("sku", sku)
        .maybeSingle();

      if (plan) {
        deliveryType = plan.delivery_type ?? "personalized";
        assetProductSku = plan.asset_product_sku;
        assetCitySlug = plan.asset_city_slug;
      }
    } else if (kind === "location_guide") {
      // legacy path -- a per-venue asset, if one ever exists, keyed the
      // same way the old system did (product_sku + city_slug)
      deliveryType = "instant_download";
      assetProductSku = sku;
      assetCitySlug = metadata.location_slug || null;
    }

    const fulfillmentStatus = deliveryType === "instant_download" ? "processing" : "awaiting_intake";

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

    if (deliveryType === "instant_download" && assetProductSku) {
      await deliverStoredAsset(supabase, {
        order,
        customer,
        sku,
        assetProductSku,
        assetCitySlug,
      });
    } else {
      await sendIntakeEmail(supabase, { order, customer, sku });
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

async function deliverStoredAsset(
  supabase: ReturnType<typeof createAdminClient>,
  {
    order,
    customer,
    sku,
    assetProductSku,
    assetCitySlug,
  }: {
    order: any;
    customer: any;
    sku: string;
    assetProductSku: string;
    assetCitySlug: string | null;
  }
) {
  let query = supabase
    .from("download_assets")
    .select("*")
    .eq("product_sku", assetProductSku)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (assetCitySlug) {
    query = query.eq("city_slug", assetCitySlug);
  }

  const { data: assets } = await query;
  const asset = assets?.[0];

  if (!asset) {
    console.error(
      `No active download_assets row for asset_product_sku=${assetProductSku}${assetCitySlug ? ` city_slug=${assetCitySlug}` : ""}`
    );
    await supabase.from("orders").update({ fulfillment_status: "manual_review" }).eq("id", order.id);
    await supabase.from("fulfillment_deliveries").insert({
      order_id: order.id,
      customer_id: customer.id,
      product_sku: sku,
      delivery_type: "instant_download",
      delivery_status: "failed",
      delivery_note: `No matching download_assets row for ${assetProductSku}${assetCitySlug ? `/${assetCitySlug}` : ""} -- needs manual delivery.`,
    });
    return;
  }

  const response = await fetch(asset.asset_url);
  if (!response.ok) {
    throw new Error(`Could not download PDF from ${asset.asset_url}. Status: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = asset.asset_name ? `${asset.asset_name}.pdf` : `${sku}.pdf`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "Ventariq <info@mail.ventariq.com>",
    to: customer.email,
    subject: `Your ${asset.asset_name || "Ventariq"} Guide Is Ready`,
    html: `<p>Hello ${customer.full_name ?? ""},</p><p>Thank you for your purchase. Your guide is attached to this email.</p><p>Best regards,<br/>Ventariq</p>`,
    attachments: [{ filename, content: buffer.toString("base64") }],
  });

  await supabase
    .from("orders")
    .update({
      fulfillment_status: "delivered",
      asset_product_sku: asset.product_sku,
      asset_city_slug: asset.city_slug,
    })
    .eq("id", order.id);

  await supabase.from("fulfillment_deliveries").insert({
    order_id: order.id,
    customer_id: customer.id,
    product_sku: sku,
    delivery_type: "instant_download",
    delivery_status: "delivered",
    delivery_note: `${asset.asset_name || sku} | ${asset.asset_url}`,
    sent_at: new Date().toISOString(),
  });
}

async function sendIntakeEmail(
  supabase: ReturnType<typeof createAdminClient>,
  { order, customer, sku }: { order: any; customer: any; sku: string }
) {
  const base = process.env.WEBSITE_URL || "https://ventariqplanner.netlify.app";
  const url = `${base}/intake?order_id=${order.id}&product_sku=${encodeURIComponent(sku)}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "Ventariq <info@mail.ventariq.com>",
    to: customer.email,
    subject: "Please Complete Your Ventariq Travel Intake Form",
    html: `<p>Hello ${customer.full_name ?? ""},</p><p>Thank you for your purchase. Your selected plan requires a few trip details before we can prepare your personalized plan.</p><p><a href="${url}">Complete your intake form here</a></p><p>Best regards,<br/>Ventariq</p>`,
  });

  await supabase.from("fulfillment_deliveries").insert({
    order_id: order.id,
    customer_id: customer.id,
    product_sku: sku,
    delivery_type: "intake_form",
    delivery_status: "sent",
    delivery_note: url,
    sent_at: new Date().toISOString(),
  });
}
