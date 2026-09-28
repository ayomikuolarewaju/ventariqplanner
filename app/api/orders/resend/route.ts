import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

const GENERIC_MESSAGE =
  "If we found any guides under that email, we've sent fresh download links.";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, email, full_name")
    .eq("email", email)
    .maybeSingle();

  if (customerError) throw customerError;
  if (!customer) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, product_sku, download_asset_id")
    .eq("customer_id", customer.id)
    .eq("fulfillment_status", "fulfilled")
    .not("download_asset_id", "is", null);

  if (ordersError) throw ordersError;
  if (!orders || orders.length === 0) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const assetIds = orders
    .map((order) => order.download_asset_id)
    .filter((id): id is string => Boolean(id));
  const { data: assets, error: assetsError } = await supabase
    .from("download_assets")
    .select("id, asset_url, asset_name")
    .in("id", assetIds)
    .eq("active", true);

  if (assetsError) throw assetsError;

  const assetsById = new Map((assets ?? []).map((asset) => [asset.id, asset]));
  const links = orders.flatMap((order) => {
    const asset = order.download_asset_id
      ? assetsById.get(order.download_asset_id)
      : undefined;
    return asset?.asset_url
      ? [{ name: asset.asset_name || order.product_sku, url: asset.asset_url }]
      : [];
  });

  if (links.length > 0) {
    const { error: sendError } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      to: customer.email,
      subject: "Your Ventariq Guides",
      html: `<p>Hello ${customer.full_name ?? ""},</p><p>Here ${
        links.length === 1 ? "is your guide" : "are your guides"
      }:</p><ul>${links
        .map((link) => `<li><a href="${link.url}">${link.name}</a></li>`)
        .join("")}</ul><p>Best regards,<br/>Ventariq</p>`,
    });

    if (sendError) throw sendError;
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}