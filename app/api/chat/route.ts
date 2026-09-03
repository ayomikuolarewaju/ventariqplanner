// app/api/chat/route.ts


import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

import { getEvents } from "@/lib/events";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "openai/gpt-oss-20b";

const FAQ_TEXT = `
Q: Which event are you interested in?
A:  US Open 2026, TIFF 2026, and Other Event / See Upcoming Events.

Q: What exactly am I buying?
A: A complete Experience Planner for one event -- tickets, venue navigation, transit, dining, and logistics, as a downloadable PDF plus an emailed backup copy.

Q: How is this different from a free travel blog?
A: Every claim is labeled by confidence: Verified, Ventariq Insight, Time Saver, Money Saver, Avoid This Mistake, or Not Yet Confirmed.

Q: How do I get my guide after paying?
A: Immediately after payment, you'll receive an instant delivery of the planner. No account or login is required to buy or download.

Q: I lost my download link.
A: Use "Resend My Guide" at /resend-guide with the email used at checkout.

Q: What about personalized plans (not a location guide)?
A: We email a short intake form first, then prepare and deliver the plan by email.

Q: Group orders?
A: Direct them to /contact for quote-based group coordination.

Q: Refunds?
A: All sales final once a digital guide is delivered.

Q: Briefly explain what the customer gets, what problems it solves, and how it differs from doing the research themselves?
A: A Ventariq Experience Planner is a ready‑made, research‑driven PDF that covers every aspect of your event: tickets, venue navigation, transit, dining, and logistics. It saves you ample time and money by providing verified, confidence‑labeled tips (Verified, Ventariq Insight, Time Saver, etc.) that a free blog can’t provide. Instead of piecing together articles, you get a single, instant‑download guide with an emailed backup—no account, no waiting, no guesswork.
`.trim();

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  /*
   * ---------------------------------------------------------
   * 1. Check Groq API configuration
   * ---------------------------------------------------------
   */

  if (!groq) {
    return NextResponse.json(
      {
        error: "Chat is not configured yet.",
      },
      {
        status: 500,
      }
    );
  }

  try {
    /*
     * ---------------------------------------------------------
     * 2. Read request body
     * ---------------------------------------------------------
     */

    const body = await req.json();

    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: "messages is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. Validate and normalize messages
     * ---------------------------------------------------------
     */

    const chatMessages: ChatCompletionMessageParam[] = messages
      .filter(
        (message: unknown): message is IncomingMessage => {
          if (!message || typeof message !== "object") {
            return false;
          }

          const m = message as Record<string, unknown>;

          return (
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
          );
        }
      )
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    if (chatMessages.length === 0) {
      return NextResponse.json(
        {
          error: "No valid messages were provided.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Load Ventariq events from database
     * ---------------------------------------------------------
     */

    const events = await getEvents();

    /*
     * ---------------------------------------------------------
     * 5. Build product catalog for the AI
     * ---------------------------------------------------------
     */

    const catalog = events
      .map((event) => {
        /*
         * Plans
         */
        const plans = event.plans
          .map((plan) => {
            const priceText =
              plan.price !== undefined && plan.price !== null
                ? `, $${plan.price}`
                : ", price on request";

            return `  - ${plan.name} (sku: ${plan.sku}${priceText}): ${plan.description}`;
          })
          .join("\n");

        /*
         * Locations / sections
         */
        const locations =
          event.locations === undefined
            ? "  (none yet)"
            : event.locations
                .map((location) => {
                  const priceText =
                    location.basePrice > 0
                      ? `, from $${location.basePrice}`
                      : ", price not yet set";

                  return `  - ${location.name} (${location.slug}${priceText}): ${location.description}`;
                })
                .join("\n");

        return `
${event.name} [${event.status}]
Description: ${event.description}

Plans:
${plans || "  (none yet)"}

Sections/Locations:
${locations || "  (none yet)"}

URL: /events/${event.slug}
        `.trim();
      })
      .join("\n\n");

    /*
     * ---------------------------------------------------------
     * 6. Build system prompt
     * ---------------------------------------------------------
     */

    const systemPrompt = `
You are the Ventariq assistant, embedded as a chat widget on ventariq.com.

Ventariq, by StratX Solutions, sells "Experience Planners" -- complete, research-driven digital guides for major events.

YOUR JOB:
- Answer visitor questions.
- Help visitors choose the right Experience Planner.
- Explain what Ventariq offers.
- Direct visitors to the correct guide or page.
- Be helpful without inventing information.

VOICE:
Confident, concise, editorial, helpful, and trustworthy.

RESPONSE LENGTH:
Keep normal replies under approximately 100 words unless the visitor specifically asks for more detail.

VERY IMPORTANT:
Never invent prices.
Never invent event dates.
Never invent locations.
Never invent product names.
Never invent availability.
Never invent features.
Never claim something is verified unless the catalog or FAQ explicitly provides that information.

Only use information contained in:
1. CURRENT CATALOG
2. FAQ

If information is missing or uncertain, say that you do not have that information and direct the visitor to /contact.

PRODUCT LINKS:
When recommending an event, use a relative markdown link.

Example:
[US Open Experience Planner](/events/us-open)

If a location has no price set yet, say:
"That location is coming soon."

REFUNDS:
Use the FAQ information. Do not make exceptions or promises about refunds.

ACCOUNT / DOWNLOAD ISSUES:
Direct users to the appropriate page from the FAQ.

GROUP ORDERS:
Direct users to /contact.

PERSONALIZED PLANS:
Explain that Ventariq sends a short intake form first and then prepares the plan by email.

CURRENT CATALOG:
${catalog || "No editions published yet."}

FAQ:
${FAQ_TEXT}
`.trim();

    /*
     * ---------------------------------------------------------
     * 7. Ask Groq
     * ---------------------------------------------------------
     */

    const completion = await groq.chat.completions.create({
      model: MODEL,

      temperature: 0.3,

      max_tokens: 500,

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        ...chatMessages,
      ],
    });

    /*
     * ---------------------------------------------------------
     * 8. Get AI response
     * ---------------------------------------------------------
     */

    const message = completion.choices?.[0]?.message?.content;

    if (!message) {
      return NextResponse.json(
        {
          message:
            "Sorry, I couldn't generate a response. Please try again.",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 9. Return response to frontend
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      message,
    });
  } catch (error) {
    /*
     * ---------------------------------------------------------
     * 10. Handle errors
     * ---------------------------------------------------------
     */

    console.error("Ventariq Groq chat error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}