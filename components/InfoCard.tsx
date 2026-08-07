"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  UserCheck,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import { EASE_OUT } from "@/lib/motion";

/**
 * InfoCard — ComfortLifeUS
 *
 * Shared "ticket stub" card used for feature/value-prop trios (homepage,
 * about page, etc). Same perforation + notch language as CityCard and
 * ProductCard, so the whole site reads as one visual family instead of
 * hand-copied divs per page.
 *
 * `icon` is a STRING key, not a component — Server Components can't pass
 * component references as props into a Client Component ("Only plain
 * objects can be passed..." error). Resolving the icon here, inside the
 * client boundary, avoids that entirely. Add new icons to ICONS below as
 * you need them.
 */

const ICONS: Record<string, LucideIcon> = {
  MapPin,
  UserCheck,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Globe2,
};

export default function InfoCard({
  icon,
  title,
  description,
  index,
}: {
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  index: number;
}) {
  const Icon = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE_OUT}}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-xl bg-[#142050] p-6"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D1B4B]">
        <Icon size={20} className="text-[#F5B301]" />
      </div>

      <h3 className="mt-5 font-display text-2xl tracking-wide">{title}</h3>

      <div className="relative my-4">
        <div
          aria-hidden
          className="absolute -left-3 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
        />
        <div
          aria-hidden
          className="absolute -right-3 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
        />
        <div className="border-t border-dashed border-white/20" />
      </div>

      <p className="text-sm text-blue-200">{description}</p>
    </motion.div>
  );
}
