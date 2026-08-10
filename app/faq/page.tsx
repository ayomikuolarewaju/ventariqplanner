"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "What exactly am I buying?",
    a: "A complete Experience Planner for one event — a single, comprehensive digital guide covering tickets, venue navigation, transit, dining, and logistics, delivered as a downloadable PDF plus an emailed backup copy.",
  },
  {
    q: "How is this different from a free travel blog?",
    a: "Every claim in a Ventariq guide is labeled by how confident we actually are — Verified, Insight, Time Saver, Money Saver, Avoid This Mistake, or Not Yet Confirmed. Free blogs give you an answer; we give you an answer and tell you exactly how much to trust it.",
  },
  {
    q: "How do I get my guide after I pay?",
    a: "Immediately after payment, you'll land on a page with a direct download link, and a copy is emailed to you as backup. No account or login is required to buy or download.",
  },
  {
    q: "I lost my download link. What now?",
    a: "Use the \"Resend My Guide\" form (linked in the footer) with the email you used at checkout, and we'll send fresh download links to any guides on file for that address.",
  },
  {
    q: "What if I bought a personalized plan, not a city/venue guide?",
    a: "Personalized plans (like a Custom Match-Day Plan) need a few trip details first. After payment, we email a short intake form — once submitted, your plan is prepared and delivered by email.",
  },
  {
    q: "Can I buy for a group?",
    a: "Yes — for larger groups or bulk orders, reach out through the Contact page rather than purchasing individually, and we'll help coordinate a quote-based arrangement.",
  },
  {
    q: "Do guides get updated after I buy?",
    a: "Yes. Editions are versioned, and we revise them when time-sensitive details change — ticket policy, pricing, or venue logistics. Check the Intelligence Desk on the homepage for what's currently live or being revised.",
  },
  {
    q: "What's your refund policy?",
    a: "Since guides are delivered instantly as digital downloads, all sales are final once the guide has been delivered. If something's genuinely wrong with your order, contact us and we'll make it right.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            Frequently Asked Questions
          </p>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.07] text-white">
            Everything you might want to know first.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="divide-y divide-[#D8D2C2] rounded-[11px] border border-[#D8D2C2] bg-white">
            {FAQS.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-serif text-[17px] text-[#152238]">
                      {item.q}
                    </span>
                    <span
                      className={`shrink-0 text-xl text-[#B8863B] transition-transform ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <div className="px-6 pb-5 text-[14.5px] leading-[1.6] text-[#5A6472]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-[14px] text-[#5A6472]">
            Still have a question?{" "}
            <Link href="/contact" className="font-semibold text-[#152238] hover:text-[#8C6423]">
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
