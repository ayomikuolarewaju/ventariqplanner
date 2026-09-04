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
        <span className = "capitalize">The Ventariq Difference - inside every Ventariq experience planner</span>
       
      </div>
      <div className="px-6 pb-6.5 pt-5.5 text-black">
        
        <p className="mb-4 text-[13.5px] text-[#5A6472]">
          Every claim, labeled by how sure we are.
          Free blogs give you an answer. We give you an answer and tell you exactly how much to trust it — the same six-tag system runs through every guide we publish.
        </p>

        <div className="mb-2.5 rounded-[3px] border-l-4 border-[#152238] bg-[#EAECF1] p-3 text-[12.8px] leading-[1.45]">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#152238]">
            ✅ VERIFIED
          </b>
          Confirmed via an official source or established primary reporting.
        </div>
        <div className="mb-2.5 rounded-[3px] border-l-4 border-[#B8863B] bg-[#FBF4E6] p-3 text-[12.8px] leading-[1.45]">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C6423]">
            💡 VENTARIQ INSIGHT 
          </b>
          Ventariq's synthesis of patterns and practical advice from experienced attendees and across multiple reliable sources.
        </div>
        <div className="rounded-[3px] border-l-4 border-[#8C1C2B] bg-[#FBEAEC] p-3 text-[12.8px] leading-[1.45]">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C1C2B]">
            ⏱ TIME SAVER  
          </b>
          A specific action that reduces waiting, confusion, or unnecessary travel.
        </div>
        <div className="rounded-[3px] border-l-4 border-[#8C1C2B] bg-[#FBEAEC] p-3 text-[12.8px] leading-[1.45] mt-2.5">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C1C2B]">
            💰 MONEY SAVER
          </b>
          A specific way to reduce cost without reducing the experience.
        </div>
        <div className="rounded-[3px] border-l-4 border-[#8C1C2B] bg-[#FBEAEC] p-3 text-[12.8px] leading-[1.45] mt-2.5">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C1C2B]">
            ⚠ AVOID THIS MISTAKE
          </b>
          A common planning error that can cost time, money or access.
        </div>
        <div className="rounded-[3px] border-l-4 border-[#8C1C2B] bg-[#FBEAEC] p-3 text-[12.8px] leading-[1.45] mt-2.5">
          <b className="mr-1 text-[11px] tracking-[0.03em] text-[#8C1C2B]">
            ⚪ NOT YET CONFIRMED 
          </b>
           Could not be independently verified — treat as a starting point and confirm before relying on it.
        </div>
      </div>
    </motion.div>
  );
}
