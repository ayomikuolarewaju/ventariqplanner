// app/api/checkout/route.ts
//
// Creates a Stripe Checkout Session priced directly from your database.
// No sign-in required -- Stripe's own checkout page collects the
// buyer's email, and the webhook creates/matches a customers row from
// that, exactly like the original Express backend did.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { resolveSku } from "@/lib/events";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }

  const item = await resolveSku(body.sku);

  if (!item) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  if (item.price <= 0) {
    return NextResponse.json(
      { error: "This item has no price set yet" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.WEBSITE_URL ?? "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // no customer_email -- Stripe's checkout page collects it
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price * 100),
            product_data: { name: item.name },
          },
        },
      ],
      metadata: {
        sku: item?.sku,
        kind: item?.kind,
        event_slug: item?.eventSlug ?? "",
        location_slug: "locationSlug" in item ? item?.locationSlug ?? "" : "",
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${item.eventSlug ?? ""}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe session creation failed:", err.message);
    return NextResponse.json(
      { error: err.message ?? "Could not create checkout session" },
      { status: 500 }
    );
  }
}
