// app/api/orders/status/route.ts

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const SUPPORT_EMAIL = "info@stratxct.com";

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

  if (order.fulfillment_status === "failed") {
    return NextResponse.json({ status: "manual_review" });
  }

  if (order.fulfillment_status !== "fulfilled") {
    return NextResponse.json({ status: "processing" });
  }

  // already shown once -- this page is a single reveal, not a
  // reusable download button. Repeat visits (refresh, bookmark, back
  // button) get directed to support instead of the file again.
  if (order.download_claimed_at) {
    return NextResponse.json({
      status: "already_claimed",
      supportEmail: SUPPORT_EMAIL,
    });
  }

  const { data: asset } = await supabase
    .from("download_assets")
    .select("asset_url")
    .eq("id", order.download_asset_id)
    .maybeSingle();

  if (!asset?.asset_url) {
    return NextResponse.json({ status: "manual_review" });
  }

  // mark claimed now, at the moment it's actually handed to the
  // browser -- not before, so a request that fails partway through
  // doesn't burn the customer's one reveal
  await supabase
    .from("orders")
    .update({ download_claimed_at: new Date().toISOString() })
    .eq("id", order.id);

  return NextResponse.json({
    status: "ready",
    kind: "instant_download",
    downloadUrl: asset.asset_url,
  });
}
