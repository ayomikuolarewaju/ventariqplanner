"use client";

import Link from "next/link";
import type { EventItem } from "@/lib/events";

/**
 * EditionCard — Ventariq
 *
 * Shared between the homepage and /events index. Each event is
 * presented as a single flagship "edition" — dark banner with dates,
 * white body with meta pills and a "View the guide" link.
 */

const GRADIENTS = [
  "linear-gradient(155deg, #11263e, #0d1420 58%, #8C1C2B 165% )",
  "linear-gradient(155deg, #101d31, #0d1420 55%, #8C6423 165%)",
];

export default function EditionCard({
  event,
  gradientIndex = 0,
}: {
  event: EventItem;
  gradientIndex?: number;
}) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group overflow-hidden rounded-[11px] bg-white shadow-[0_18px_40px_-22px_rgba(21,34,56,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_50px_-20px_rgba(21,34,56,0.4)]"
    >
      <div
        className="relative flex h-[180px] flex-col justify-end overflow-hidden p-5.5 text-white bg-[#880000]"
        
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 " />
        <span className="absolute right-4.5 top-4.5 z-10 rounded-[20px] bg-[#880000] border border-white/30 bg-white/[0.14] px-2.5 py-1 text-[11px] tracking-[0.03em]">
          {event.status === "upcoming" ? "2026 Edition" : "Past Edition"}
        </span>
        <div className="relative z-10 mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#B8863B]">
          {event.sport}
        </div>
        <h3 className="relative z-10 font-serif text-2xl text-white">
          {event.name} Experience Planner
        </h3>
      </div>
      <div className="px-6.5 pb-7 pt-6">
        <p className="mb-4.5 text-[14.5px] text-[#5A6472]">
          {event.description}
        </p>
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="rounded-[20px] bg-[#F4F1EA] px-2.5 py-1 text-[11.5px] text-[#2A3E5C]">
            {event.locations?.length} sections
          </span>
          <span className="rounded-[20px] bg-[#F4F1EA] px-2.5 py-1 text-[11.5px] text-[#2A3E5C]">
            {event?.plans?.length} plans
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#152238]">
          View the planner
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
