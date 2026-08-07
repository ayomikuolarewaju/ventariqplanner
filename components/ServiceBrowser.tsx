"use client";

import { useState } from "react";
import PurchaseButton from "@/components/PurchaseButton";

type Service = {
  category: string;
  name: string;
  description: string;
};

export default function ServiceBrowser({
  services,
  isUnlocked,
  guideSku,
}: {
  services: Service[];
  isUnlocked: boolean;
  guideSku: string;
}) {
  const categories = Array.from(new Set(services.map((s) => s.category)));
  const [active, setActive] = useState(categories[0]);

  const activeServices = services.filter((s) => s.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-[#D8D2C2] pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-[20px] px-4 py-2 text-[13px] font-semibold transition-colors ${
              active === cat
                ? "bg-[#152238] text-white"
                : "bg-[#F4F1EA] text-[#5A6472] hover:text-[#152238]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {activeServices.map((service, i) => {
          const locked = !isUnlocked && i > 0;

          return (
            <div
              key={service.name}
              className="relative overflow-hidden rounded-[10px] border border-[#D8D2C2] bg-white p-5"
            >
              <h4 className="font-serif text-lg text-[#152238]">
                {service.name}
              </h4>
              <p
                className={`mt-2 text-[13.5px] text-[#5A6472] ${
                  locked ? "blur-sm select-none" : ""
                }`}
              >
                {service.description}
              </p>

              {locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/85 backdrop-blur-[1px]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6423]">
                    Locked
                  </span>
                  <span className="text-xs text-[#5A6472]">
                    Purchase the guide to unlock
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isUnlocked && (
        <div className="mt-8 rounded-[10px] border border-dashed border-[#D8D2C2] p-5">
          <p className="text-[13.5px] text-[#5A6472]">
            You&apos;re seeing a preview. Purchase the full guide for
            every service across all categories, plus the downloadable
            PDF.
          </p>
          <div className="mt-4">
            <PurchaseButton sku={guideSku} />
          </div>
        </div>
      )}
    </div>
  );
}
