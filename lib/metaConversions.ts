// lib/metaConversions.ts
//
// Server-side Meta Conversions API (CAPI). Used for both Purchase
// (from the Stripe webhook -- only runs on confirmed payment) and
// InitiateCheckout (from /api/checkout -- only runs when a real
// Checkout Session was actually created).
//
// Setup:
//   1. Meta Events Manager -> your Pixel -> Settings -> Conversions API
//      -> Generate Access Token
//   2. Add to .env: META_CONVERSIONS_API_TOKEN=...
//   3. For testing: Events Manager -> Test Events tab shows a code at
//      the top -- set META_TEST_EVENT_CODE to it temporarily to see
//      events land there in real time instead of waiting on the
//      Overview dashboard, which can lag by hours on low volume.
//      Remove/unset it once you're confident things work.

import crypto from "crypto";

const PIXEL_ID = "2333573084081776";
const API_VERSION = "v21.0"; // check https://developers.facebook.com/docs/marketing-api/conversions-api for current version

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

type SendEventArgs = {
  eventName: "Purchase" | "InitiateCheckout";
  eventId: string; // shared with the client-side fire for the same action, so Meta deduplicates
  email?: string;
  valueCents?: number;
  currency?: string;
  eventSourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
};

export async function sendMetaEvent({
  eventName,
  eventId,
  email,
  valueCents,
  currency,
  eventSourceUrl,
  clientIp,
  userAgent,
}: SendEventArgs) {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!token) {
    console.error(`META_CONVERSIONS_API_TOKEN not set -- skipping ${eventName} CAPI event`);
    return;
  }

  const userData: Record<string, any> = {};
  if (email) userData.em = [hashValue(email)];
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;

  const customData: Record<string, any> =
    valueCents != null
      ? { currency: (currency ?? "usd").toUpperCase(), value: valueCents / 100 }
      : {};

  const payload: Record<string, any> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const body = await res.json();

    if (!res.ok) {
      console.error(`Meta CAPI ${eventName} event failed:`, res.status, body);
    } else {
      console.log(`Meta CAPI ${eventName} event sent:`, JSON.stringify(body));
    }
  } catch (err: any) {
    console.error(`Meta CAPI ${eventName} request failed:`, err.message);
  }
}

// Backwards-compatible wrapper for the existing Purchase call site
export async function sendPurchaseEvent(args: Omit<SendEventArgs, "eventName">) {
  return sendMetaEvent({ ...args, eventName: "Purchase" });
}
