"use client";

import Link from "next/link";
import type { Location } from "@/lib/events";
import PurchaseButton from "@/components/PurchaseButton";

export default function LocationCard({
  eventSlug,
  location,
}: {
  eventSlug: string;
  location: Location;
}) {
  const guideSku = `${eventSlug}_${location.slug}_guide`;

  return (
    <div className="group rounded-[11px] border border-[#D8D2C2] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(21,34,56,0.35)]">
      <Link href={`/events/${eventSlug}/locations/${location.slug}`} className="block">
        <h3 className="mb-2 font-serif text-xl text-[#152238]">
          {location.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-[13.8px] text-[#5A6472]">
          {location.description}
        </p>
      </Link>

      <div className="flex items-center justify-between gap-3">
        {location.basePrice > 0 ? (
          <span className="text-[13px] font-bold text-[#8C6423]">
            From ${location.basePrice.toFixed(2)}
          </span>
        ) : (
          <span />
        )}
        <Link
          href={`/events/${eventSlug}/locations/${location.slug}`}
          className="text-[13px] font-semibold text-[#5A6472] hover:text-[#152238]"
        >
          View details →
        </Link>
      </div>

      {location.basePrice > 0 && (
        <div className="mt-4 border-t border-[#D8D2C2] pt-4">
          <PurchaseButton sku={guideSku} />
        </div>
      )}
    </div>
  );
}
