// app/events/[slug]/page.tsx


import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import LocationCard from "@/components/LocationCard";
import PurchaseButton from "@/components/PurchaseButton";
import { getEvent } from "@/lib/events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};

  return {
    title: `${event.name} Experience Planner`,
    description: event.description,
    openGraph: {
      title: `${event.name} Experience Planner`,
      description: event.description,
      images: event.heroImage ? [event.heroImage] : undefined,
    },
  };
}

export default async function EventLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // The flagship, purchasable planner for this event -- the first
  // plan configured in /admin/events. Previously this button used a
  // made-up sku ("{slug}_{slug}_guide") that never matched anything
  // in the plans table, so it silently failed at checkout.
  const flagshipPlan = event.plans?.[0];

  const plannerBenefits = [
    `Practical planning information for ${event.name}`,
    "Transportation, accommodation and destination guidance",
    "Event-day planning and useful travel intelligence",
  ];

  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white flex flex-col gap-5 md:gap-10">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            {event.eyebrow}
          </p>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.07] text-white">
            {event.name} Experience Planner
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-[#C9C2A8]">
            {event.description}
          </p>
          {event.status === "past" && (
            <span className="mt-6 inline-block rounded-[20px] border border-white/20 bg-white/[0.06] px-4 py-2 text-xs uppercase tracking-widest text-white/60">
              This edition has concluded — shown for reference
            </span>
          )}
        </div>
        <div className="container">
          {event.locations && event.locations.length > 0 && (
            <div>
              <div className="grid gap-5 md:grid-cols-3">
                {event.locations.map((location) => (
                  <LocationCard
                    key={location.slug}
                    eventSlug={event.slug}
                    location={location}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-8 py-20 md:gap-12 md:mt-10">
        <div className="container">
          <h2 className="mb-5 text-[21.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            Inside the Planner
          </h2>

          {event.saleImage && (
            <div className="overflow-hidden rounded-lg">
              <Image
                src={event.saleImage.startsWith("/") ? event.saleImage : `/${event.saleImage}`}
                alt={`${event.name} Experience Planner`}
                width={1000}
                height={600}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          )}
        </div>

        <div className="container">
          <div className="max-w-3xl">
            <h3 className="font-serif text-2xl font-bold leading-[1.07] text-[#152238] md:text-3xl">
              Why travelers use the Ventariq {event.name} Planner
            </h3>

            <p className="mt-4 text-[17px] leading-7 text-[#3F4650]">
              {event.description}
            </p>
          </div>
        </div>

        <div className="container">
          <div className="grid gap-5 md:grid-cols-3">
            {plannerBenefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-xl border border-black/10 bg-[#0D1420] p-6"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-[#0D1420] text-sm font-bold bg-[#B8863B]">
                  ✓
                </div>
                <p className="text-[15px] leading-6 text-white">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of product + objection-handling, right before the CTA */}
        

        <div className="container">
          <div className="rounded-2xl bg-[#0D1420] p-7 text-white md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
                  Get the Planner
                </p>
                <h3 className="font-serif text-3xl font-bold">
                  Plan your {event.name} experience with confidence.
                </h3>
                <p className="mt-4 text-[15px] leading-6 text-[#C9C2A8]">
                  Get the complete Ventariq planner and have the
                  practical information you need in one place.
                </p>
              </div>

              <div className="shrink-0">
                {flagshipPlan ? (
                  <>
                    {flagshipPlan.price != null && (
                      <p className="mb-2 text-right font-serif text-2xl font-bold text-[#B8863B]">
                        ${flagshipPlan.price}
                      </p>
                    )}
                    <PurchaseButton sku={flagshipPlan.sku} />
                  </>
                ) : (
                  <p className="text-sm text-[#C9C2A8]">
                    This planner isn&apos;t available for purchase yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
