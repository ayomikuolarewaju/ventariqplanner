// app/api/orders/status/route.ts
//
// GET /api/orders/status?session_id=cs_...
//
// Looks up an order by its Stripe checkout session id -- this doubles
// as the access control for guest checkout, since only the actual
// purchaser has that id (Stripe puts it in the success_url redirect).
// No auth session needed or expected.

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
    // webhook may not have landed yet -- tell the client to keep polling
    return NextResponse.json({ status: "pending" });
  }

  const isLocationGuide = !!order.location_slug;

  if (isLocationGuide) {
    if (order.fulfillment_status !== "delivered") {
      return NextResponse.json({ status: "processing", kind: "location_guide" });
    }

    const storagePath = `${order.event_slug}/${order.location_slug}/${order.id}.pdf`;
    const { data: signed } = await supabase.storage
      .from("guides")
      .createSignedUrl(storagePath, 60 * 30); // 30 minutes

    return NextResponse.json({
      status: "ready",
      kind: "location_guide",
      downloadUrl: signed?.signedUrl ?? null,
    });
  }

  // plan (personalized) order -- no PDF to download directly, intake
  // email already sent by the webhook
  return NextResponse.json({
    status: "ready",
    kind: "plan",
  });
}
