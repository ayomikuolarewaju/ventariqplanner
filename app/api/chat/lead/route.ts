// app/api/chat/lead/route.ts

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function isConversationMessage(value: unknown): value is ConversationMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.length <= 10000
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const phone = typeof values.phone === "string" ? values.phone.trim() : "";
  const conversation = values.conversation;

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    name.length > 200 ||
    phone.length > 50 ||
    !Array.isArray(conversation) ||
    conversation.length > 100 ||
    !conversation.every(isConversationMessage)
  ) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { error: insertError } = await supabase.from("chat_leads").insert({
      name: name || null,
      email,
      phone: phone || null,
      conversation,
    });

    if (insertError) {
      console.error("Failed to save chat lead:", insertError.message);
      return NextResponse.json(
        { error: "Could not save your info" },
        { status: 500 }
      );
    }

    const transcript = conversation
      .map(
        (message) =>
          `<p><strong>${message.role === "user" ? "Visitor" : "Assistant"}:</strong><br>${escapeHtml(message.content).replace(/\r?\n/g, "<br>")}</p>`
      )
      .join("");

    const { error: resendError } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      to: "info@stratxct.com",
      replyTo: email,
      subject: "New Chat Support Request",
      html: `<p>A visitor requested help through the Ventariq chat.</p><ul><li><strong>Name:</strong> ${escapeHtml(name || "Not provided")}</li><li><strong>Email:</strong> ${escapeHtml(email)}</li><li><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</li></ul><h3>Conversation</h3>${transcript || "<p>No conversation transcript was provided.</p>"}`,
    });

    if (resendError) {
      console.error("Resend chat lead error:", resendError);
      return NextResponse.json(
        { error: "Could not send your info" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process chat lead:", error);
    return NextResponse.json(
      { error: "Could not send your info" },
      { status: 500 }
    );
  }
}
