// app/intake/page.tsx

import IntakeForm from "@/components/IntakeForm";

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-[#0D1B4B]">
      <section className="border-b border-dashed border-white/10">
        <div className="container py-20">
          <p className="font-mono text-xs tracking-[0.3em] text-[#9DB2FF]">
            TRIP INTAKE
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-wide">
            Tell us about your trip.
          </h1>
          <p className="mt-4 max-w-lg text-blue-200">
            A few details now means a plan that&apos;s actually built
            around your dates, city, and group — not a generic template.
          </p>
        </div>
      </section>

      <div className="container py-14 px-4">
        <IntakeForm />
      </div>
    </main>
  );
}
