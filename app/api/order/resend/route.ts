// app/api/orders/resend/route.ts
//
// POST { email } -> always returns a generic success message, whether
// or not the email matches anything -- this avoids leaking which
// emails have purchase history (a minor but real privacy/security
// practice for any email-based lookup with no password).

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
    // don't reveal whether the email exists
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("fulfillment_status", "delivered")
    .not("location_slug", "is", null);

  if (!orders || orders.length === 0) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const links: { name: string; url: string }[] = [];

  for (const order of orders) {
    const storagePath = `${order.event_slug}/${order.location_slug}/${order.id}.pdf`;
    const { data: signed } = await supabase.storage
      .from("guides")
      .createSignedUrl(storagePath, 60 * 60 * 24); // 24 hours -- longer than the immediate post-checkout link

    if (signed?.signedUrl) {
      links.push({ name: order.location_slug, url: signed.signedUrl });
    }
  }

  if (links.length > 0) {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "ComfortLifeUS <info@mail.comfortlifeus.com>",
      to: customer.email,
      subject: "Your ComfortLifeUS Guides",
      html: `<p>Hello ${customer.full_name ?? ""},</p><p>Here ${
        links.length === 1 ? "is your guide" : "are your guides"
      }, ready to download (links valid for 24 hours):</p><ul>${links
        .map((l) => `<li><a href="${l.url}">${l.name}</a></li>`)
        .join("")}</ul><p>Best regards,<br/>ComfortLifeUS</p>`,
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
