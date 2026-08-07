// lib/events.ts
//
// Was a static array; now reads from Supabase (events, plans,
// event_locations tables — see supabase-schema-events.sql). Every
// function is now async — callers that used to do `getEvent(slug)`
// need `await getEvent(slug)`.
//
// Service content (categories + individual services) is fetched
// separately via getLocationServices/getLocationCategories, since
// pages that don't need it (the plans grid, the events index) shouldn't
// pay for that join.

import { createClient } from "@/lib/supabase-server";

export type Plan = {
  sku: string;
  name: string;
  description: string;
  features?: string[];
  price?: number;
};

export type Location = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  basePrice: number;
};

export type EventItem = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  status: "upcoming" | "past";
  eyebrow: string;
  tagline: string;
  description: string;
  heroImage?: string;
  routeItems: { code: string; label: string }[];
  locations?: Location[];
  plans: Plan[];
};

function mapEvent(row: any, plans: any[], locations: any[]): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sport: row.sport,
    status: row.status,
    eyebrow: row.eyebrow,
    tagline: row.tagline,
    description: row.description,
    heroImage: row.hero_image ?? undefined,
    routeItems: row.route_items ?? [],
    plans: plans.map((p) => ({
      sku: p.sku,
      name: p.name,
      description: p.description,
      features: p.features ?? [],
      price: p.price ?? undefined,
    })),
    locations: locations.map((l) => ({
      id: l.id,
      slug: l.slug,
      name: l.name,
      description: l.description,
      image: l.image ?? undefined,
      basePrice: Number(l.base_price ?? 0),
    })),
  };
}

export async function getEvents(): Promise<EventItem[]> {
  const supabase = await createClient();

  const { data: eventRows } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (!eventRows) return [];

  const eventIds = eventRows.map((e) => e.id);

  const [{ data: allPlans }, { data: allLocations }] = await Promise.all([
    supabase.from("plans").select("*").in("event_id", eventIds),
    supabase.from("event_locations").select("*").in("event_id", eventIds),
  ]);

  return eventRows.map((row) =>
    mapEvent(
      row,
      (allPlans ?? []).filter((p) => p.event_id === row.id),
      (allLocations ?? []).filter((l) => l.event_id === row.id)
    )
  );
}

export async function getEvent(slug: string): Promise<EventItem | undefined> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!row) return undefined;

  const [{ data: plans }, { data: locations }] = await Promise.all([
    supabase.from("plans").select("*").eq("event_id", row.id),
    supabase.from("event_locations").select("*").eq("event_id", row.id),
  ]);

  return mapEvent(row, plans ?? [], locations ?? []);
}

export async function getFeaturedEvent(): Promise<EventItem> {
  const events = await getEvents();
  return events.find((e) => e.status === "upcoming") ?? events[0];
}

export async function getLocation(eventSlug: string, locationSlug: string) {
  const event = await getEvent(eventSlug);
  const location = event?.locations?.find((l) => l.slug === locationSlug);
  return event && location ? { event, location } : null;
}

// Flat shape for ServiceBrowser / CityGuideDocument, which just want
// {category, name, description}[] — category pricing is a separate call.
export async function getLocationServices(locationId: string) {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, location_services(name, description)")
    .eq("location_id", locationId);

  return (categories ?? []).flatMap((cat: any) =>
    (cat.location_services ?? []).map((s: any) => ({
      category: cat.name,
      name: s.name,
      description: s.description,
    }))
  );
}

export async function getLocationCategories(locationId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("service_categories")
    .select("id, name, addon_price")
    .eq("location_id", locationId);

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    addonPrice: c.addon_price != null ? Number(c.addon_price) : null,
  }));
}

// Resolves a checkout sku to what's actually being sold — a plan, or a
// location guide (sku format: `${eventSlug}_${locationSlug}_guide`) —
// so /api/checkout can look up the real price server-side rather than
// trusting anything the client sends.
export async function resolveSku(sku: string) {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("plans")
    .select("*, events(slug, eyebrow)")
    .eq("sku", sku)
    .maybeSingle();

  if (plan) {
    return {
      kind: "plan" as const,
      sku: plan.sku,
      name: plan.name,
      price: plan.price != null ? Number(plan.price) : 0,
      eventSlug: plan.events?.slug,
    };
  }

  if (sku.endsWith("_guide")) {
    const { data: locations } = await supabase
      .from("event_locations")
      .select("*, events(slug)");

    const match = (locations ?? []).find(
      (l: any) => `${l.events.slug}_${l.slug}_guide` === sku
    );

    if (match) {
      return {
        kind: "location_guide" as const,
        sku,
        name: match.name,
        price: Number(match.base_price ?? 0),
        eventSlug: match.events.slug,
        locationSlug: match.slug,
      };
    }
  }

  return null;
}
