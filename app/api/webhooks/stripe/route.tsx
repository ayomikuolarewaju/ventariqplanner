// app/api/webhooks/stripe/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mailer";
import { resend } from "@/lib/resend";
import { sendPurchaseEvent } from "@/lib/metaConversions";

async function markOrderDeliveryFailure(
  supabase: ReturnType<typeof createAdminClient>,
  {
    order,
    customer,
    sku,
    reason,
  }: { order: any; customer: any; sku: string; reason: string }
) {
  await supabase.from("orders").update({ fulfillment_status: "failed" }).eq("id", order.id);

  await supabase.from("fulfillment_deliveries").insert({
    order_id: order.id,
    customer_id: customer.id,
    product_sku: sku,
    delivery_type: "instant_download",
    delivery_status: "failed",
    delivery_note: reason,
    sent_at: new Date().toISOString(),
  });
}

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
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existingOrderError) throw existingOrderError;

    if (
      existingOrder &&
      ["fulfilled", "awaiting_intake"].includes(existingOrder.fulfillment_status)
    ) {
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

    // One direct ID lookup -- no string matching, no case sensitivity,
    // no typos possible. Either the location/plan has a real linked
    // asset, or it doesn't.
    let downloadAssetId: string | null = null;

    if (kind === "plan") {
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("download_asset_id")
        .eq("sku", sku)
        .maybeSingle();

      if (planError) throw planError;
      downloadAssetId = plan?.download_asset_id ?? null;
    } else if (kind === "location_guide") {
      const { data: eventRow, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("slug", metadata.event_slug)
        .maybeSingle();

      if (eventError) throw eventError;

      if (eventRow) {
        const { data: location, error: locationError } = await supabase
          .from("event_locations")
          .select("download_asset_id")
          .eq("event_id", eventRow.id)
          .ilike("slug", metadata.location_slug)
          .maybeSingle();

        if (locationError) throw locationError;
        downloadAssetId = location?.download_asset_id ?? null;
      }
    }

    let order = existingOrder;

    if (!order) {
      const { data: insertedOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customer.id,
          product_sku: sku,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          amount_cents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          payment_status: session.payment_status ?? "paid",
          fulfillment_status: "processing",
          event_slug: metadata.event_slug || null,
          location_slug: kind === "location_guide" ? metadata.location_slug || null : null,
        })
        .select("*")
        .single();

      if (orderError) throw orderError;
      order = insertedOrder;
    }

    if (downloadAssetId && session.payment_status === "paid") {
      const { error: purchaseError } = await supabase.from("purchases").upsert(
        {
          buyer_id: customer.id,
          pdf_id: downloadAssetId,
          payment_provider: "stripe",
          payment_reference: session.id,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "usd",
          status: "success",
          confirmed_at: new Date().toISOString(),
        },
        { onConflict: "payment_reference" }
      );

      if (purchaseError) throw purchaseError;
    }

    // Server-side Purchase event -- fires only here, from a webhook
    // Stripe only calls on genuinely confirmed payment. The
    // existingOrder check above already guarantees this code path runs
    // at most once per session, so this can't double-fire on Stripe's
    // webhook retries.
    if (session.payment_status === "paid") {
      try {
        await sendPurchaseEvent({
          eventId: session.id,
          email: customer.email,
          valueCents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          eventSourceUrl: session.success_url,
        });
      } catch (metaError) {
        console.error("Purchase conversion event failed:", metaError);
      }
    }

    if (downloadAssetId) {
      await deliverStoredAsset(supabase, { order, customer, sku, downloadAssetId });
    } else if (kind === "location_guide") {
      // no asset linked yet in admin -- flag for manual handling
      // rather than sending a misleading intake-form email
      const reason = `Location "${metadata.location_slug}" under event "${metadata.event_slug}" has no PDF linked in admin -- needs manual delivery.`;
      await markOrderDeliveryFailure(supabase, { order, customer, sku, reason });
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
    downloadAssetId,
  }: { order: any; customer: any; sku: string; downloadAssetId: string }
) {
  const { data: priorDelivery, error: priorDeliveryError } = await supabase
    .from("fulfillment_deliveries")
    .select("id, delivery_status")
    .eq("order_id", order.id)
    .in("delivery_status", ["delivered", "sent"])
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (priorDeliveryError) throw priorDeliveryError;

  const { data: asset, error: assetError } = await supabase
    .from("download_assets")
    .select("*")
    .eq("id", downloadAssetId)
    .eq("active", true)
    .maybeSingle();

  if (assetError) throw assetError;

  if (!asset) {
    const reason = `Linked asset (id: ${downloadAssetId}) not found or inactive -- needs manual delivery.`;
    console.error(reason);
    await markOrderDeliveryFailure(supabase, { order, customer, sku, reason });
    return;
  }

  if (priorDelivery?.delivery_status === "delivered") {
    const { error: recoveredOrderError } = await supabase
      .from("orders")
      .update({ fulfillment_status: "fulfilled", download_asset_id: asset.id })
      .eq("id", order.id);
    if (recoveredOrderError) throw recoveredOrderError;
    return;
  }

  if (!asset.asset_url) {
    const reason = `Asset (id: ${asset.id}) has no asset_url -- delivery cannot proceed.`;
    console.error(reason);
    await markOrderDeliveryFailure(supabase, { order, customer, sku, reason });
    return;
  }

  try {
    if (!order.stripe_checkout_session_id) {
      throw new Error("Order has no Stripe payment reference for its controlled download link.");
    }

    const base = process.env.WEBSITE_URL || "https://stratxct.com";
    const downloadUrl = `${base}/api/download/${encodeURIComponent(order.stripe_checkout_session_id)}`;

    const { error: emailError } = await resend.emails.send({
      to: customer.email,
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      subject: `Your ${asset.asset_name || "Ventariq"} Planner Is Ready`,
      html: `
        <p>Hello ${customer.full_name ?? ""},</p>
        <p>Thank you for your purchase. Your planner is available to download here. You have three download authorizations over seven days.</p>
        <p><a href="${downloadUrl}">Download your planner</a></p>
        <p>Best regards,<br/>Ventariq</p>
      `,
    });
    if (emailError) throw emailError;

    const { error: fulfilledOrderError } = await supabase
      .from("orders")
      .update({ fulfillment_status: "fulfilled", download_asset_id: asset.id })
      .eq("id", order.id);
    if (fulfilledOrderError) throw fulfilledOrderError;

    const { error: deliveryError } = await supabase.from("fulfillment_deliveries").insert({
      order_id: order.id,
      customer_id: customer.id,
      product_sku: sku,
      delivery_type: "instant_download",
      delivery_status: "delivered",
      delivery_note: `${asset.asset_name || sku} | ${asset.id}`,
      sent_at: new Date().toISOString(),
    });
    if (deliveryError) throw deliveryError;
  } catch (error) {
    const reason =
      error instanceof Error
        ? `Planner delivery failed: ${error.message}`
        : "Planner delivery failed for an unknown reason.";
    console.error(reason);
    await markOrderDeliveryFailure(supabase, { order, customer, sku, reason });
    throw error;
  }
}

async function sendIntakeEmail(
  supabase: ReturnType<typeof createAdminClient>,
  { order, customer, sku }: { order: any; customer: any; sku: string }
) {
  const base = process.env.WEBSITE_URL || "https://stratxct.com";
  const url = `${base}/intake?order_id=${order.id}&product_sku=${encodeURIComponent(sku)}`;

  await sendEmail({
    to: customer.email,
    subject: "Please Complete Your Ventariq Travel Intake Form",
    html: `<p>Hello ${customer.full_name ?? ""},</p><p>Thank you for your purchase. Your selected plan requires a few trip details before we can prepare your personalized plan.</p><p><a href="${url}">Complete your intake form here</a></p><p>Best regards,<br/>Ventariq</p>`,
  });

  const { error: deliveryError } = await supabase.from("fulfillment_deliveries").insert({
    order_id: order.id,
    customer_id: customer.id,
    product_sku: sku,
    delivery_type: "intake_form",
    delivery_status: "sent",
    delivery_note: url,
    sent_at: new Date().toISOString(),
  });
  if (deliveryError) throw deliveryError;

  const { error: statusError } = await supabase
    .from("orders")
    .update({ fulfillment_status: "awaiting_intake" })
    .eq("id", order.id);
  if (statusError) throw statusError;
}
