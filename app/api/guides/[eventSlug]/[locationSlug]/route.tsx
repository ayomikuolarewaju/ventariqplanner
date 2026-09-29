// app/api/guides/[eventSlug]/[locationSlug]/route.tsx

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { CityGuideDocument } from "@/lib/pdf/CityGuideDocument";
import { getLocation, getLocationServices } from "@/lib/events";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ eventSlug: string; locationSlug: string }> }
) {
  const { eventSlug, locationSlug } = await params;
  const found = await getLocation(eventSlug, locationSlug);

  if (!found) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const { event, location } = found;
  const guideSku = `${event.slug}_${location.slug}_guide`;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json(
      { error: "No completed purchase found for this planner" },
      { status: 403 }
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, stripe_checkout_session_id")
    .eq("customer_id", customer.id)
    .eq("product_sku", guideSku)
    .eq("fulfillment_status", "fulfilled")
    .maybeSingle();

  if (!order) {
    return NextResponse.json(
      { error: "No completed purchase found for this planner" },
      { status: 403 }
    );
  }

  if (!order.stripe_checkout_session_id) {
    return NextResponse.json(
      { error: "No active download authorization found for this purchase" },
      { status: 403 }
    );
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("payment_reference")
    .eq("payment_reference", order.stripe_checkout_session_id)
    .eq("status", "success")
    .maybeSingle();

  if (purchaseError) {
    console.error("Planner purchase lookup failed:", purchaseError);
    return NextResponse.json({ error: "Could not verify purchase" }, { status: 500 });
  }
  if (!purchase) {
    return NextResponse.json(
      { error: "No active download authorization found for this purchase" },
      { status: 403 }
    );
  }

  const storagePath = `${event.slug}/${location.slug}/${customer.id}.pdf`;

  const { data: existing } = await supabase.storage
    .from("guides")
    .createSignedUrl(storagePath, 60 * 5);

  let signedUrl = existing?.signedUrl;

  if (!signedUrl) {
    const services = await getLocationServices(location.id);

    const buffer = await renderToBuffer(
      <CityGuideDocument
        eyebrow={event.eyebrow}
        cityName={location.name}
        tagline={location.description}
        heroImage={location.image}
        services={services}
      />
    );

    const { error: uploadError } = await supabase.storage
      .from("guides")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from("guides")
      .createSignedUrl(storagePath, 60 * 5);

    if (signError || !signed) {
      return NextResponse.json(
        { error: signError?.message ?? "Could not sign URL" },
        { status: 500 }
      );
    }

    signedUrl = signed.signedUrl;
  }

  const { data: authorization, error: authorizationError } = await createAdminClient().rpc(
    "consume_purchase_download",
    { p_reference: purchase.payment_reference }
  );

  if (authorizationError) {
    console.error("Planner download authorization failed:", authorizationError);
    return NextResponse.json({ error: "Could not authorize download" }, { status: 500 });
  }
  if (!authorization?.length) {
    return NextResponse.json(
      { error: "This purchase has used its download authorizations or its access window expired" },
      { status: 429 }
    );
  }

  return NextResponse.json({ url: signedUrl });
}
