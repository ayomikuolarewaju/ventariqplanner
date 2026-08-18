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
    a: "Every claim in a Ventariq guide is labeled by how confident we actually are — Verified, Ventariq Insight, Time Saver, Money Saver, Avoid This Mistake, or Not Yet Confirmed. Free blogs give you an answer; we give you an answer and tell you exactly how much to trust it.",
  },
  {
    q: "How do I get my guide after I pay?",
    a: "Immediately after payment, you'll receive an instant delivery of the planner. No account or login is required to buy or download.",
  },
  {
    q: "I lost my planner. What now?",
    a: "Use the \"Resend My Planner\" form (linked in the footer) with the email you used at checkout, and we'll send fresh planner  to that email address.",
  },
  {
    q: "Can I buy for a group?",
    a: "Yes — for larger groups or bulk orders, reach out through the Contact page rather than purchasing individually, and we'll help coordinate a quote-based arrangement.",
  },
  {
    q: "Do planners get updated after I buy?",
    a: "Yes. we provide you with QRCode to monitor time sensitive changes — ticket policy, pricing, or venue logistics, as events progress."
  },
  {
    q: "What's your refund policy?",
    a: "Since planners are delivered instantly, all sales are final once the planner has been delivered. If something's genuinely wrong with your order, contact us and we'll make it right.",
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
