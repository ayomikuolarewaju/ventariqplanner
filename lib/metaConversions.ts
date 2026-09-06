// lib/metaConversions.ts
//
// Server-side Meta Conversions API (CAPI) -- sends the Purchase event
// directly from the Stripe webhook, which only ever runs on a genuinely
// confirmed payment. This is the reliable half of the tracking; the
// client-side pixel fire on the success page is a supplementary signal
// only, using the same event_id so Meta deduplicates the two into one
// event with better match quality.
//
// Setup:
//   1. Meta Events Manager -> your Pixel -> Settings -> Conversions API
//      -> Generate Access Token
//   2. Add to .env: META_CONVERSIONS_API_TOKEN=...
//   3. META_PIXEL_ID should match the id used in components/MetaPixel.tsx

import crypto from "crypto";

const PIXEL_ID = "2333573084081776";
const API_VERSION = "v21.0"; // check https://developers.facebook.com/docs/marketing-api/conversions-api for current version

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendPurchaseEvent({
  eventId,
  email,
  valueCents,
  currency,
  eventSourceUrl,
}: {
  eventId: string; // use the Stripe session id -- matches the client-side fire for dedup
  email: string;
  valueCents: number;
  currency: string;
  eventSourceUrl?: string;
}) {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!token) {
    console.error("META_CONVERSIONS_API_TOKEN not set -- skipping Purchase CAPI event");
    return;
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: {
          em: [hashValue(email)],
        },
        custom_data: {
          currency: currency.toUpperCase(),
          value: valueCents / 100,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("Meta CAPI Purchase event failed:", res.status, body);
    }
  } catch (err: any) {
    console.error("Meta CAPI request failed:", err.message);
  }
}
