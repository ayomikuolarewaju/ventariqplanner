"use client";

import Link from "next/link";

/**
 * MiniFaq — Ventariq
 *
 * Three purchase-adjacent objections, answered right where the
 * decision happens, instead of requiring a separate click to /faq.
 * Content matches the real FAQ page -- not a separate policy.
 */

const ITEMS = [
  {
    q: "How fast will I get my planner?",
    a: "Instantly. You'll land on a download page the moment payment completes, and we email a backup copy too — no waiting, no account required.",
  },
  {
    q: "What if it's not what I expected?",
    a: "Since it's delivered instantly as a digital download, sales are final once delivered — but if something's genuinely wrong with your order, contact us and we'll make it right.",
  },
  {
    q: "Still have a question first?",
    a: "Use the chat button in the corner, or visit our full FAQ — we read every message.",
  },
];

export default function MiniFaq() {
  return (
    <div className="rounded-[10px] border border-[#D8D2C2] bg-[#FCFBF8] p-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#8C6423]">
        Before You Buy
      </p>
      <div className="space-y-4">
        {ITEMS.map((item) => (
          <div key={item.q}>
            <p className="mb-1 text-[14px] font-bold text-[#152238]">{item.q}</p>
            <p className="text-[13.5px] leading-[1.5] text-[#5A6472]">{item.a}</p>
          </div>
        ))}
      </div>
      <Link
        href="/faq"
        className="mt-4 inline-block text-[12.5px] font-semibold text-[#8C6423] hover:text-[#152238]"
      >
        See the full FAQ →
      </Link>
    </div>
  );
}
