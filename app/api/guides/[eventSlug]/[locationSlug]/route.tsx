// app/api/guides/[eventSlug]/[locationSlug]/route.tsx

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase-server";
import { CityGuideDocument } from "@/lib/pdf/CityGuideDocument";
import { getLocation, getLocationServices } from "@/lib/events";

export async function GET(
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
      { error: "No completed purchase found for this guide" },
      { status: 403 }
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", customer.id)
    .eq("product_sku", guideSku)
    .eq("fulfillment_status", "fulfilled")
    .maybeSingle();

  if (!order) {
    return NextResponse.json(
      { error: "No completed purchase found for this guide" },
      { status: 403 }
    );
  }

  const storagePath = `${event.slug}/${location.slug}/${customer.id}.pdf`;

  const { data: existing } = await supabase.storage
    .from("guides")
    .createSignedUrl(storagePath, 60 * 10);

  if (existing?.signedUrl) {
    return NextResponse.json({ url: existing.signedUrl });
  }

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
    .createSignedUrl(storagePath, 60 * 10);

  if (signError || !signed) {
    return NextResponse.json(
      { error: signError?.message ?? "Could not sign URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: signed.signedUrl });
}
