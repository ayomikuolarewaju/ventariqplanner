// app/api/chat/lead/route.ts

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, phone, conversation } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("chat_leads").insert({
    name: name || null,
    email,
    phone: phone || null,
    conversation: conversation ?? null,
  });

   const { data, error: resendError } =await resend.emails.send({
    from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
    to: email,
    subject: "New Chat Lead",
    html: `<p>A new chat lead has been submitted:</p><ul><li><strong>Name:</strong> ${name || "Not provided"}</li><li><strong>Email:</strong> ${email}</li><li><strong>Phone:</strong> ${phone || "Not provided"}</li><li><strong>Conversation:</strong> ${conversation || "Not provided"}</li></ul>`,
  });

  if (resendError) {
  console.error("Resend error:", resendError);
  }
  
  if (error) {
    console.error("Failed to save chat lead:", error.message);
    return NextResponse.json({ error: "Could not save your info" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
