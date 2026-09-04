// app/events/[slug]/locations/[locationSlug]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PurchaseButton from "@/components/PurchaseButton";
import ServiceBrowser from "@/components/ServiceBrowser";
import DownloadGuideButton from "@/components/DownloadGuideButton";
import { createClient } from "@/lib/supabase-server";
import { getLocation, getLocationServices } from "@/lib/events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}): Promise<Metadata> {
  const { slug, locationSlug } = await params;
  const found = await getLocation(slug, locationSlug);
  if (!found) return {};

  const { location } = found;
  return {
    title: location.name,
    description: location.description,
    openGraph: {
      title: location.name,
      description: location.description,
      images: location.image ? [location.image] : undefined,
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}) {
  const { slug, locationSlug } = await params;
  const found = await getLocation(slug, locationSlug);

  if (!found) {
    notFound();
  }

  const { event, location } = found;
  const guideSku = `${event.slug}_${location.slug}_guide`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isUnlocked = false;

  if (user?.email) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (customer) {
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("product_sku", guideSku)
        .eq("fulfillment_status", "fulfilled")
        .maybeSingle();

      isUnlocked = !!order;
    }
  }

  const services = await getLocationServices(location.id);

  return (
    <main>
      <section className="bg-[#0D1420] py-16 text-white">
        <div className="container">
          <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            {event.eyebrow}
          </p>
          <h1 className="font-serif text-4xl font-bold text-white">
            {location.name}
          </h1>
          <p className="mt-4 max-w-xl text-[16px] text-[#C9C2A8]">
            {location.description}
          </p>
          {location.basePrice > 0 && (
            <p className="mt-3 text-sm font-bold text-[#B8863B]">
              From ${location.basePrice.toFixed(2)}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-4">
            {!isUnlocked && <PurchaseButton sku={guideSku} />}
            {isUnlocked && (
              <DownloadGuideButton
                eventSlug={event.slug}
                locationSlug={location.slug}
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {services.length > 0 ? (
            <ServiceBrowser
              services={services}
              isUnlocked={isUnlocked}
              guideSku={guideSku}
            />
          ) : (
            <p className="text-[#5A6472]">
              Service details for {location.name} are coming soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
