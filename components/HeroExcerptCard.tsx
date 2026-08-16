"use client";

import { motion } from "framer-motion";

export default function HeroExcerptCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y:0, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 overflow-hidden rounded-[10px] bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center justify-between bg-[#152238] px-5.5 py-4 font-serif text-sm text-white">
        <span className = "capitalize">inside every ventariq experience planner</span>
       
      </div>
      <div className="px-6 pb-6.5 pt-5.5">
        <h4 className="mb-2.5 font-serif text-base text-[#152238]">
          Event Intelligence
        </h4>
        <p className="mb-4 text-[13.5px] text-[#5A6472]">
          Real excerpt, real labeling — this is what every information on Ventariq planner looks like.
        </p>

        <div className="mb-2.5 rounded-[3px] border-l-4 border-[#152238] bg-[#EAECF1] p-3 text-[12.8px] leading-[1.45]">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#152238]">
            ✅ VERIFIED
          </b>
          Rush lines release unclaimed seats ~15–30 min before showtime.
        </div>
        <div className="mb-2.5 rounded-[3px] border-l-4 border-[#B8863B] bg-[#FBF4E6] p-3 text-[12.8px] leading-[1.45]">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C6423]">
            💡 INSIDER TIP
          </b>
          Discovery-section tickets offer the best odds-to-price ratio.
        </div>
        <div className="rounded-[3px] border-l-4 border-[#8C1C2B] bg-[#FBEAEC] p-3 text-[12.8px] leading-[1.45]">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C1C2B]">
            ☣️ CAVEAT 
          </b>
          Buying from anywhere but Ticketmaster.ca or your official
          account.
        </div>
        <div className="rounded-[3px] border-l-4 border-[#8C1C2B] bg-[#FBEAEC] p-3 text-[12.8px] leading-[1.45] mt-2.5">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C1C2B]">
            ❎ UNCONFIRMED
          </b>
          Buying from anywhere but Ticketmaster.ca or your official
          account.
        </div>
      </div>
    </motion.div>
  );
}
