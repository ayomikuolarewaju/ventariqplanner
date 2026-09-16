# Ventariq

**Event Travel Intelligence** — destination guides for major events, sold as a PDF plus an in-app browsing experience.

🔗 **Live:** [ventariqplanner.netlify.app](https://ventariqplanner.netlify.app/)

Built for **StratX Solutions**, founded by Dr. Mojeed Oyeniyi. Ventariq started as a travel guide for the 2026 FIFA World Cup and has since expanded into a general platform for event-based travel guides ("Editions"), currently featuring the US Open.

## What it does

Travellers heading to a major event buy a guide — venue and location intelligence, planning help, and support — delivered as a PDF with an accompanying in-app browsing view so they don't have to leave the app to explore it.

## Features

- **Editions system** — each event (US Open, and others as they're added) gets its own dedicated page with location and venue guides
- **Guest checkout** — customers buy straight through Stripe with no sign-in required, to keep friction low
- **Automated delivery** — PDF guide and confirmation are emailed automatically on purchase
- **Guide recovery** — an email-based "resend my guide" page for customers who lose their delivery
- **Admin system** — manage events, plans, locations, and per-category add-on pricing without touching code
- **Intelligence Desk** — a content section of real travel-planning articles, using a confidence-tag callout system, each ending with a CTA back to the relevant guide
- **AI concierge widget** — a floating chat widget (Claude-powered) on every page, answering FAQs and recommending which guide to buy
- **SEO + PWA** — meta tags, sitemap, and installable app support

## Tech stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (customers, products, orders, travel intake, AI plans, support tickets)
- **Payments:** Stripe (per-product payment links)
- **AI:** Claude API, for the on-site concierge widget

## Architecture notes

- Checkout is guest-only by design — no account required to purchase, only an email
- Products use Stripe payment links directly rather than a custom checkout backend, keeping the payment flow simple to maintain
- Content (Intelligence Desk articles, Editions) is structured so new events can be added through the admin system rather than hardcoded

## Status

Live and in active use by real customers.
