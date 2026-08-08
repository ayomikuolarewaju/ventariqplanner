// components/PlanDetailLayout.tsx

import PurchaseButton from "@/components/PurchaseButton";

type PlanDetailProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  sku?: string;
  features?: string[];
};

export default function PlanDetailLayout({
  eyebrow,
  title,
  description,
  sku,
  features,
}: PlanDetailProps) {
  return (
    <main>
      <section className="bg-[#0D1420] py-16 text-white">
        <div className="container">
          <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            {eyebrow}
          </p>
          <h1 className="max-w-2xl font-serif text-4xl font-bold text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[16px] text-[#C9C2A8]">
            {description}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <div className="max-w-xl rounded-[11px] border border-[#D8D2C2] bg-white p-7">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C6423]">
              What&apos;s Included
            </p>
            <ul className="space-y-3">
              {features?.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[14px] text-[#2A3E5C]">
                  <span className="mt-0.5 text-[#8C6423]">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-[#D8D2C2] pt-6">
              <PurchaseButton sku={sku} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
