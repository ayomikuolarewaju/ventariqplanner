"use client";

import { CALLOUT_META, type CalloutKind } from "@/lib/intelligence-articles";

/**
 * GuideExcerptCard — Ventariq
 *
 * Proof-of-product card for event/product pages: shows a real excerpt
 * from inside the guide, using the same Verified/Insight/Avoid callout
 * system as the Intelligence Desk articles and the homepage hero. This
 * belongs on the actual purchase page, not just the homepage -- someone
 * deciding whether to buy needs to see what they're buying.
 */

type Callout = { kind: CalloutKind; text: string };

export default function GuideExcerptCard({
  sectionLabel,
  heading,
  title,
  description,
  callouts,
}: {
  sectionLabel: string;
  heading: string;
  title: string;
  description: string;
  callouts: Callout[];
}) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_20px_45px_-20px_rgba(21,34,56,0.35)]">
      <div className="flex items-center justify-between bg-[#152238] px-5.5 py-4 font-serif text-sm text-white">
        <span>{heading}</span>
        <span className="rounded-[3px] bg-[#B8863B] px-2.5 py-1 text-[10.5px] font-bold tracking-[0.04em] text-[#0D1420]">
          {sectionLabel}
        </span>
      </div>

      <div className="px-6 pb-6.5 pt-5.5">
        <h4 className="mb-2.5 font-serif text-base text-[#152238]">{title}</h4>
        <p className="mb-4 text-[13.5px] text-[#5A6472]">{description}</p>

        <div className="space-y-2.5">
          {callouts.map((c, i) => {
            const meta = CALLOUT_META[c.kind];
            return (
              <div
                key={i}
                className="rounded-[3px] border-l-4 p-3 text-[12.8px] leading-[1.45]"
                style={{ backgroundColor: meta.bg, borderColor: meta.text }}
              >
                <b className="mr-1 text-[11px] tracking-[0.03em]" style={{ color: meta.text }}>
                  {meta.label}
                </b>
                <span style={{ color: meta.text }}>{c.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
