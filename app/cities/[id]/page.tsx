// app/cities/[slug]/page.tsx

import { cities } from "@/lib/cities";
import PurchaseButton from "@/components/PurchaseButton";
import ServiceBrowser from "@/components/ServiceBrowser";
import DownloadGuideButton from "@/components/DownloadGuideButton";
import { createClient } from "@/lib/supabase-server";

export default async function CityPage({
  params,
}: {
  params: { slug: string };
}) {
  const city = cities.find((x) => x.slug === params.slug);

  if (!city) {
    return <div>City not found</div>;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isUnlocked = false;

  if (user) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_id", user.id)
      .eq("product_sku", `${city.slug}_city_guide`)
      .eq("fulfillment_status", "completed")
      .maybeSingle();

    isUnlocked = !!order;
  }

  const { data: services } = await supabase
    .from("city_services")
    .select("category, name, description")
    .eq("city_slug", city.slug);

  return (
    <main className="container py-20">
      <h1 className="text-5xl font-bold">{city.name} World Cup Guide</h1>

      <p className="mt-6 text-xl text-blue-200">{city.description}</p>

      <div className="mt-8 flex flex-wrap gap-4">
        {!isUnlocked && <PurchaseButton sku="single_city_guide" />}
        {isUnlocked && <DownloadGuideButton locationSlug={city.slug} />}
      </div>

      <section className="mt-16">
        {services && services.length > 0 ? (
          <ServiceBrowser
            services={services}
            isUnlocked={isUnlocked}
            guideSku={city.slug}
          />
        ) : (
          <p className="text-blue-200">
            Service details for {city.name} are coming soon.
          </p>
        )}
      </section>
    </main>
  );
}
