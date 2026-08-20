// app/api/chat/lead/route.ts

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

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

  if (error) {
    console.error("Failed to save chat lead:", error.message);
    return NextResponse.json({ error: "Could not save your info" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
