// app/admin/locations/[locationId]/pricing/page.tsx

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LocationPricingManager from "@/components/LocationPricingManager";

export default async function LocationPricingPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const supabase = await createClient();

  const { data: location } = await supabase
    .from("event_locations")
    .select("id, name")
    .eq("id", locationId)
    .maybeSingle();

  if (!location) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, addon_price, location_services(id, name, description)")
    .eq("location_id", locationId);

  return (
    <main className="container py-10">
      <h1 className="text-4xl font-bold mb-2">{location.name} Pricing</h1>
      <p className="mb-8 text-blue-200">
        Manage service categories and optional add-on pricing for this
        location&apos;s guide.
      </p>

      <LocationPricingManager
        locationId={locationId}
        initialCategories={(categories ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          addonPrice: c.addon_price != null ? String(c.addon_price) : "",
          services: (c.location_services ?? []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
          })),
        }))}
      />
    </main>
  );
}
