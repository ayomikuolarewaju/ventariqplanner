"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EASE_OUT } from "@/lib/motion";

/**
 * Hero — ComfortLifeUS
 *
 * Now data-driven so it can represent whichever event is currently
 * featured (US Open today, World Cup before it, whatever comes next) —
 * pass an EventItem-shaped object in in rather than hardcoding one event.
 */

type RouteItem = { code: string; label: string };

type HeroProps = {
  eyebrow?: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  heroImage?: string;
  routeItems: RouteItem[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export default function Hero({
  eyebrow,
  titleLine1,
  titleLine2,
  tagline,
  heroImage,
  routeItems,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0D1B4B]">
      <div className="absolute inset-0">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            width={1920}
            height={1080}
            priority
            className="object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B4B]/40 via-[#0D1B4B]/85 to-[#0D1B4B]" />
      </div>

      <div
        aria-hidden
        className="absolute -right-24 top-0 h-[140%] w-[45%] rotate-[8deg] bg-[#E8002D]/90"
        style={{ clipPath: "polygon(40% 0, 60% 0, 30% 100%, 10% 100%)" }}
      />
      <div
        aria-hidden
        className="absolute -right-10 top-0 h-[140%] w-[45%] rotate-[8deg] bg-[#F5B301]/70"
        style={{ clipPath: "polygon(40% 0, 48% 0, 18% 100%, 10% 100%)" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container relative py-28 md:py-36"
      >
        <motion.p
          variants={rise}
          className="font-mono text-sm tracking-[0.3em] text-[#9DB2FF]"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          variants={rise}
          className="mt-4 max-w-3xl font-display text-6xl leading-[0.95] tracking-wide md:text-8xl"
        >
          {titleLine1}
          <br />
          <span className="text-[#E8002D]">{titleLine2}</span>
        </motion.h1>

        <motion.p
          variants={rise}
          className="mt-6 max-w-xl text-lg text-blue-200"
        >
          {tagline}
        </motion.p>

        <motion.div variants={rise} className="mt-9 flex flex-wrap gap-4">
          <a
            href={primaryHref}
            className="rounded bg-[#E8002D] px-7 py-3 font-bold transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E8002D]/30"
          >
            {primaryLabel}
          </a>
          <a
            href={secondaryHref}
            className="rounded border border-white/25 px-7 py-3 font-bold text-white/90 transition-colors hover:border-white/60"
          >
            {secondaryLabel}
          </a>
        </motion.div>

        <motion.div
          variants={rise}
          className="mt-16 border-t border-dashed border-white/20 pt-6"
        >
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs tracking-widest text-white/50">
            {routeItems.map((r) => (
              <span key={r.code} className="flex items-center gap-2">
                <span className="text-[#F5B301]">{r.code}</span>
                <span className="text-white/30">/</span>
                <span>{r.label}</span>
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
