import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const { name, email, message } = body as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !message.trim() ||
    name.length > 200 ||
    email.length > 320 ||
    message.length > 10000
  ) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      to: "info@stratxct.com",
      subject: "New Contact Form Message",
      html: `<p><strong>Name:</strong> ${escapeHtml(name.trim())}</p><p><strong>Email:</strong> ${escapeHtml(email.trim())}</p><p><strong>Message:</strong></p><p>${escapeHtml(message.trim()).replace(/\r?\n/g, "<br>")}</p>`,
    });

    if (error) {
      console.error("Resend contact form error:", error);
      return NextResponse.json(
        { error: "Could not send your message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return NextResponse.json(
      { error: "Could not send your message" },
      { status: 500 }
    );
  }
}