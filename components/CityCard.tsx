"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EASE_OUT } from "@/lib/motion";

/**
 * CityCard — ComfortLifeUS
 *
 * Same "ticket stub" language as the Hero: a photo half (the "boarding" side)
 * torn away from an info half (the "stub") by a dashed perforation with
 * punched notch cutouts on each side. Reinforces that this guide is the
 * traveller's ticket into that city's World Cup experience.
 *
 * Expects `city` to come from lib/cities. If your City type doesn't yet
 * have `image` or `code`, add them:
 *   image: string   -> e.g. "/cities/miami.jpg" (1200x800+, landscape)
 *   code?: string    -> optional 3-letter tag, e.g. "MIA" (falls back to
 *                        the first 3 letters of the name)
 */

type City = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  code?: string;
};

export default function CityCard({ city }: { city: City }) {
  const code = (city.code ?? city.name.slice(0, 3)).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-xl bg-[#142050] shadow-lg shadow-black/20"
    >
      <Link href={`/cities/${city.slug}`}>
        {/* photo half */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={city.image ?? `/cities/${city.slug}.png`}
            alt={city.name}
            width={1600}
            height={900}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#142050] via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded bg-black/40 px-2 py-1 font-mono text-[11px] tracking-widest text-[#F5B301] backdrop-blur-sm">
            {code}
          </span>
        </div>

        {/* perforation with punched notches */}
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

        {/* stub half */}
        <div className="p-5">
          <h3 className="font-display text-2xl tracking-wide">
            {city.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-blue-200">
            {city.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs tracking-widest text-[#E8002D] transition-transform group-hover:translate-x-1">
            VIEW GUIDE →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
