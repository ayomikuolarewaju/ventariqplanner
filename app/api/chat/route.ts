// app/api/chat/route.ts
//
// npm install @anthropic-ai/sdk
// Add to .env: ANTHROPIC_API_KEY=sk-ant-...
//
// Builds the system prompt fresh on every request from your actual
// events/plans/locations -- no hardcoded pricing to go stale. Check
// https://docs.claude.com for the current recommended model string
// before shipping; adjust MODEL below if it's changed since this was written.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getEvents } from "@/lib/events";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-5";

const FAQ_TEXT = `
Q: What exactly am I buying? A: A complete Experience Planner for one event -- tickets, venue navigation, transit, dining, and logistics, as a downloadable PDF plus an emailed backup copy.
Q: How is this different from a free travel blog? A: Every claim is labeled by confidence: Verified, Ventariq Insight, Time Saver, Money Saver, Avoid This Mistake, or Not Yet Confirmed.
Q: How do I get my guide after paying? A: Immediately on the success page (direct download link) plus an emailed backup. No account/login required to buy or download.
Q: I lost my download link. A: Use "Resend My Guide" at /resend-guide with the email used at checkout.
Q: What about personalized plans (not a location guide)? A: We email a short intake form first, then prepare and deliver the plan by email.
Q: Group orders? A: Direct them to /contact for quote-based group coordination.
Q: Refunds? A: All sales final once a digital guide is delivered.
`.trim();


export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Chat is not configured yet." },
      { status: 500 }
    );
  }

  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const events = await getEvents();

  const catalog = events
    .map((e) => {
      const plans = e.plans
        .map(
          (p) =>
            `  - ${p.name} (sku: ${p.sku}${p.price ? `, $${p.price}` : ", price on request"}): ${p.description}`
        )
        .join("\n");
      const locations = e.locations === undefined
        ? "  (none yet)"
        : e.locations
        .map(
          (l) =>
            `  - ${l.name} (${l.slug}${l.basePrice > 0 ? `, from $${l.basePrice}` : ", price not yet set"}): ${l.description}`
        )
        .join("\n");

      return `${e.name} [${e.status}] -- ${e.description}\nPlans:\n${plans || "  (none yet)"}\nSections/Locations:\n${locations || "  (none yet)"}\nURL: /events/${e.slug}`;
    })
    .join("\n\n");

  const systemPrompt = `You are the Ventariq assistant, embedded as a chat widget on ventariq.com. Ventariq (by StratX Solutions) sells "Experience Planners" -- complete, research-driven digital guides for major events.

Your job: answer questions and help visitors pick the right guide/plan for their trip, then point them to buy it.

VOICE: confident, concise, editorial -- matches Ventariq's brand (see FAQ tone below). Keep replies under ~100 words unless the person asks for more detail. Never invent prices, dates, or details not given below.

CURRENT CATALOG (live from the database):
${catalog || "No editions published yet."}

FAQ:
${FAQ_TEXT}

When recommending something, link to it in markdown, e.g. [US Open Experience Planner](/events/us-open). If a location has no price set yet, say it's coming soon rather than making one up. For anything outside this scope (refund disputes, account issues, anything you're unsure about), direct them to /contact.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });

    const text = response.content.find((b) => b.type === "text");

    return NextResponse.json({
      message: text?.type === "text" ? text.text : "Sorry, I couldn't generate a response.",
    });
  } catch (err: any) {
    console.error("Chat request failed:", err.message);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
