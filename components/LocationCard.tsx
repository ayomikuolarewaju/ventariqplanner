"use client";

import Link from "next/link";
import type { Location } from "@/lib/events";

export default function LocationCard({
  eventSlug,
  location,
}: {
  eventSlug: string;
  location: Location;
}) {
  return (
    <Link
      href={`/events/${eventSlug}/locations/${location.slug}`}
      className="group block rounded-[11px] border border-[#D8D2C2] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(21,34,56,0.35)]"
    >
      <h3 className="mb-2 font-serif text-xl text-[#152238]">
        {location.name}
      </h3>
      <p className="mb-4 line-clamp-2 text-[13.8px] text-[#5A6472]">
        {location.description}
      </p>
      <div className="flex items-center justify-between">
        {location.basePrice > 0 ? (
          <span className="text-[13px] font-bold text-[#8C6423]">
            From ${location.basePrice.toFixed(2)}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#152238]">
          View section
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
