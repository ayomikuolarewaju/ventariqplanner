// lib/stripe.ts
//
// npm install stripe
// Add to .env: STRIPE_SECRET_KEY=sk_... (and STRIPE_WEBHOOK_SECRET, set
// after creating the webhook endpoint in the Stripe Dashboard)

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});
