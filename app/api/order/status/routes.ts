// app/api/orders/status/route.ts
//
// GET /api/orders/status?session_id=cs_...

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ status: "pending" });
  }

  if (order.fulfillment_status === "awaiting_intake") {
    return NextResponse.json({ status: "ready", kind: "plan" });
  }

  if (order.fulfillment_status === "manual_review") {
    return NextResponse.json({ status: "manual_review" });
  }

  if (order.fulfillment_status !== "delivered") {
    return NextResponse.json({ status: "processing" });
  }

  // delivered -- order.asset_product_sku/asset_city_slug were set by
  // the webhook to record exactly which download_assets row was sent
  let query = supabase
    .from("download_assets")
    .select("asset_url, asset_name")
    .eq("product_sku", order.asset_product_sku)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (order.asset_city_slug) {
    query = query.eq("city_slug", order.asset_city_slug);
  }

  const { data: assets } = await query;
  const asset = assets?.[0];

  return NextResponse.json({
    status: "ready",
    kind: "instant_download",
    downloadUrl: asset?.asset_url ?? null,
  });
}
