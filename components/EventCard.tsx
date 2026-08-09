"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { EventItem } from "@/lib/events";
import { EASE_OUT } from "@/lib/motion";

/**
 * EventCard — ComfortLifeUS
 *
 * Same ticket-stub family as CityCard/ProductCard, one level up: this
 * represents a whole event (US Open, World Cup, whatever's next) rather
 * than a single city or plan. Status badge distinguishes upcoming vs past
 * so the events index reads clearly even as the roster changes over time.
 */

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-xl bg-[#142050] shadow-lg shadow-black/20"
    >
      <Link href={`/events/${event.slug}`}>
        <div className="relative h-48 w-full overflow-hidden">
          {event.heroImage && (
            <Image
              src={event.heroImage}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#142050] via-transparent to-transparent" />

          <span
            className={`absolute left-4 top-4 rounded px-2 py-1 font-mono text-[11px] tracking-widest backdrop-blur-sm ${
              event.status === "upcoming"
                ? "bg-[#E8002D]/80 text-white"
                : "bg-black/40 text-white/60"
            }`}
          >
            {event.status === "upcoming" ? "UPCOMING" : "PAST"}
          </span>

          <span className="absolute right-4 top-4 rounded bg-black/40 px-2 py-1 font-mono text-[11px] tracking-widest text-[#F5B301] backdrop-blur-sm">
            {event.sport.toUpperCase()}
          </span>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
          />
          <div
            aria-hidden
            className="absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
          />
          <div className="border-t border-dashed border-white/25" />
        </div>

        <div className="p-5">
          <h3 className="font-display text-2xl tracking-wide">
            {event.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-blue-200">
            {event.tagline}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs tracking-widest text-[#E8002D] transition-transform group-hover:translate-x-1">
            VIEW PLANNER →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
