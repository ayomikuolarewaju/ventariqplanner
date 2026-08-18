"use client";

import Link from "next/link";
import type { Location } from "@/lib/events";

export default function LocationCard({
  eventSlug,
  location,
}: {
  eventSlug?: string;
  location: Location;
}) {
  return (
    <Link
      href={`/events/${eventSlug}/locations/${location.slug}`}
      className="group block rounded-[11px] border border-[#D8D2C2] bg-white p-3 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(21,34,56,0.35)]"
    >
      <div className="flex flex-col items-start justify-start">
        <p className="font-serif text-[17px] font-bold text-[#152238]">
          {location.name}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#152238] block">
          View section
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
