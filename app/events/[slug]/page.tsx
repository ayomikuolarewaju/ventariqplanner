// app/events/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import LocationCard from "@/components/LocationCard";
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

  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
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
      </section>

      <section className="py-20">
        <div className="container">
          {event.locations && event.locations.length > 0 && (
            <div className="mb-20">
              <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
                {event.status === "upcoming" ? "Sections" : "Host Cities"}
              </p>
              <h2 className="mb-6 font-serif text-3xl font-bold text-[#152238]">
                Browse this edition.
              </h2>
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

          {event.plans && event.plans.length > 0 && (
            <div>
              <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
                Plans
              </p>
              <h2 className="mb-6 font-serif text-3xl font-bold text-[#152238]">
                Choose your planner.
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {event.plans.map((plan) => (
                  <div key={plan.sku}>
                    <ProductCard
                      product={{
                        sku: plan.sku,
                        name: plan.name,
                        description: plan.description,
                        features: plan.features,
                        price: plan.price,
                      }}
                    />
                    <Link
                      href={`/events/${event.slug}/${plan.sku}`}
                      className="mt-3 inline-block text-[13px] font-semibold text-[#5A6472] hover:text-[#152238]"
                    >
                      View full details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
