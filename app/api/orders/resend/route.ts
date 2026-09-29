import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

const GENERIC_MESSAGE =
  "If we found any Planner under that email, we've sent fresh download links.";

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

  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("payment_reference, downloads_used, download_limit, download_expires_at, download_assets(asset_name)")
    .eq("buyer_id", customer.id)
    .eq("status", "success")
    .gt("download_expires_at", new Date().toISOString());

  if (purchasesError) throw purchasesError;
  if (!purchases || purchases.length === 0) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const links = purchases
    .filter((purchase) => purchase.downloads_used < purchase.download_limit)
    .map((purchase) => ({
      name: purchase.download_assets?.[0]?.asset_name || "Your Planner",
      url: `${process.env.WEBSITE_URL || "https://stratxct.com"}/api/download/${encodeURIComponent(purchase.payment_reference)}`,
    }));

  if (links.length > 0) {
    const { error: sendError } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      to: customer.email,
      subject: "Your Ventariq Planners",
      html: `<p>Hello ${customer.full_name ?? ""},</p><p>Here ${
        links.length === 1 ? "is your Planner" : "are your Planners"
      }:</p><ul>${links
        .map((link) => `<li><a href="${link.url}">${link.name}</a></li>`)
        .join("")}</ul><p>Best regards,<br/>Ventariq</p>`,
    });

    if (sendError) throw sendError;
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}