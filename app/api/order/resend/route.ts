// app/api/orders/resend/route.ts

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

  const { data: customer } = await supabase
    .from("customers")
    .select("id, email, full_name")
    .eq("email", email)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("fulfillment_status", "delivered")
    .not("asset_product_sku", "is", null);

  if (!orders || orders.length === 0) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const links: { name: string; url: string }[] = [];

  for (const order of orders) {
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

    if (asset?.asset_url) {
      links.push({ name: asset.asset_name || order.product_sku, url: asset.asset_url });
    }
  }

  if (links.length > 0) {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "Ventariq <info@mail.ventariq.com>",
      to: customer.email,
      subject: "Your Ventariq Guides",
      html: `<p>Hello ${customer.full_name ?? ""},</p><p>Here ${
        links.length === 1 ? "is your guide" : "are your guides"
      }:</p><ul>${links
        .map((l) => `<li><a href="${l.url}">${l.name}</a></li>`)
        .join("")}</ul><p>Best regards,<br/>Ventariq</p>`,
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
