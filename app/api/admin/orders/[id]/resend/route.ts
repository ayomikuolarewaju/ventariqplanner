import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  fetchAssetBuffer,
  resolveAssetDownloadUrl,
} from "@/lib/assestDelivery";
import { resend } from "@/lib/resend";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: admin } = await authClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, customers(full_name, email)")
      .eq("id", id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.customers?.email) {
      return NextResponse.json(
        { error: "This order has no customer email" },
        { status: 400 }
      );
    }

    let downloadAssetId = order.download_asset_id as string | null;

    if (!downloadAssetId && order.event_slug && order.location_slug) {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("slug", order.event_slug)
        .maybeSingle();

      if (eventError) throw eventError;

      const { data: location, error: locationError } = await supabase
        .from("event_locations")
        .select("download_asset_id")
        .eq("event_id", event?.id ?? "")
        .eq("slug", order.location_slug)
        .maybeSingle();

      if (locationError) throw locationError;
      downloadAssetId = location?.download_asset_id ?? null;
    }

    if (!downloadAssetId) {
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("download_asset_id")
        .eq("sku", order.product_sku)
        .maybeSingle();

      if (planError) throw planError;
      downloadAssetId = plan?.download_asset_id ?? null;
    }

    if (!downloadAssetId) {
      return NextResponse.json(
        { error: "This order has no linked downloadable asset" },
        { status: 400 }
      );
    }

    const { data: asset, error: assetError } = await supabase
      .from("download_assets")
      .select("id, asset_name, asset_url, storage_bucket, storage_path")
      .eq("id", downloadAssetId)
      .eq("active", true)
      .maybeSingle();

    if (assetError) throw assetError;
    if (!asset) {
      return NextResponse.json(
        { error: "The linked asset is missing or inactive" },
        { status: 400 }
      );
    }

    if (!asset.asset_url && !(asset.storage_bucket && asset.storage_path)) {
      return NextResponse.json(
        {
          error:
            "This planner asset is missing its PDF URL or storage reference, so it cannot be resent.",
        },
        { status: 400 }
      );
    }

    const buffer = await fetchAssetBuffer(supabase, asset);
    const filename = `${asset.asset_name || order.product_sku || "ventariq-planner"}.pdf`;
    const downloadUrl = await resolveAssetDownloadUrl(supabase, asset, 60 * 60 * 24 * 7);

    const { error: sendError } = await resend.emails.send({
      to: order.customers.email,
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      subject: `Your ${asset.asset_name || "Ventariq"} Planner`,
      html: `
        <p>Hello ${order.customers.full_name ?? ""},</p>
        <p>Here is your Ventariq planner again. It is attached to this email and also available to download here:</p>
        <p><a href="${downloadUrl}">Download your planner</a></p>
        <p>Best regards,<br/>Ventariq</p>
      `,
      attachments: [{ filename, content: buffer.toString("base64") }],
    });

    if (sendError) throw sendError;

    const { error: deliveryError } = await supabase
      .from("fulfillment_deliveries")
      .insert({
        order_id: order.id,
        customer_id: order.customer_id,
        product_sku: order.product_sku,
        delivery_type: "instant_download",
        delivery_status: "delivered",
        delivery_note: "Planner resent manually by an admin.",
        sent_at: new Date().toISOString(),
      });

    if (deliveryError) throw deliveryError;

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        download_asset_id: asset.id,
        fulfillment_status: "fulfilled",
      })
      .eq("id", order.id);

    if (orderUpdateError) throw orderUpdateError;

    return NextResponse.json({ message: "Planner resent successfully" });
  } catch (error) {
    console.error("Manual planner resend failed:", error);
    const message = error instanceof Error ? error.message : "Could not resend planner";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}