// // app/admin/events/[id]/edit/page.tsx

// import { notFound } from "next/navigation";
// import { createClient } from "@/lib/supabase-server";
// import EventForm from "@/components/EventForm";

// export default async function EditEventPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;
//   const supabase = await createClient();

//   const { data: event } = await supabase
//     .from("events")
//     .select("*")
//     .eq("id", id)
//     .maybeSingle();

//   if (!event) {
//     notFound();
//   }

//   const [{ data: plans }, { data: locations }] = await Promise.all([
//     supabase.from("plans").select("*").eq("event_id", id),
//     supabase.from("event_locations").select("*").eq("event_id", id),
//   ]);

//   return (
//     <main className="container py-10">
//       <h1 className="text-4xl font-bold mb-8">Edit {event.name}</h1>
//       <EventForm
//         initialEvent={{
//           id: event.id,
//           slug: event.slug,
//           name: event.name,
//           sport: event.sport,
//           status: event.status,
//           eyebrow: event.eyebrow,
//           tagline: event.tagline,
//           description: event.description,
//           heroImage: event.hero_image ?? "",
//           saleImage: event.sale_image ?? "",
//           routeItems: event.route_items ?? [],
//         }}
//         initialPlans={(plans ?? []).map((p) => ({
//           id: p.id,
//           sku: p.sku,
//           name: p.name,
//           description: p.description,
//           features: (p.features ?? []).join("\n"),
//           price: p.price != null ? String(p.price) : "",
//         }))}
//         initialLocations={(locations ?? []).map((l) => ({
//           id: l.id,
//           slug: l.slug,
//           name: l.name,
//           description: l.description,
//           image: l.image ?? "",
//           basePrice: l.base_price != null ? String(l.base_price) : "",
//           assetProductSku: l.asset_product_sku ?? "",
//           assetCitySlug: l.asset_city_slug ?? "",
//         }))}
//       />
//     </main>
//   );
// }
