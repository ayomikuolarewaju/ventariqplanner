"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * EventForm — ComfortLifeUS Admin
 *
 * Handles both create and edit for an event, plus its nested plans and
 * locations in one save action. On edit, plans/locations are fully
 * replaced (deleted + reinserted) rather than diffed — simplest correct
 * approach for admin-scale data volumes. Uses the browser Supabase
 * client directly; RLS (is_admin() policies from the schema) is what
 * actually enforces write access, not this UI.
 */

type PlanDraft = {
  id?: string;
  sku: string;
  name: string;
  description: string;
  features: string; // newline-separated in the UI, split on save
  price: string;
};

type LocationDraft = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  basePrice: string;
  downloadAssetId: string;
  assetProductSku: string;
  assetCitySlug: string;
};

type EventDraft = {
  id?: string;
  slug: string;
  name: string;
  sport: string;
  status: "upcoming" | "past";
  eyebrow: string;
  tagline: string;
  description: string;
  heroImage: string;
  saleImage: string;
  routeItems: { code: string; label: string }[];
};

export default function EventForm({
  initialEvent,
  initialPlans,
  initialLocations,
}: {
  initialEvent?: EventDraft;
  initialPlans?: PlanDraft[];
  initialLocations?: LocationDraft[];
}) {
  const router = useRouter();
  const isEdit = !!initialEvent?.id;

  const [event, setEvent] = useState<EventDraft>(
    initialEvent ?? {
      slug: "",
      name: "",
      sport: "",
      status: "upcoming",
      eyebrow: "",
      tagline: "",
      description: "",
      heroImage: "",
      saleImage: "",
      routeItems: [],
    }
  );
  const [plans, setPlans] = useState<PlanDraft[]>(initialPlans ?? []);
  const [locations, setLocations] = useState<LocationDraft[]>(
    initialLocations ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateEvent<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setEvent((e) => ({ ...e, [key]: value }));
  }

  function addPlan() {
    setPlans((p) => [
      ...p,
      { sku: "", name: "", description: "", features: "", price: "" },
    ]);
  }
  function updatePlan(i: number, key: keyof PlanDraft, value: string) {
    setPlans((p) => p.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  }
  function removePlan(i: number) {
    setPlans((p) => p.filter((_, idx) => idx !== i));
  }

  function addLocation() {
    setLocations((l) => [
      ...l,
      { slug: "", name: "", description: "", image: "", basePrice: "", downloadAssetId: "", assetProductSku: "", assetCitySlug: "" },
    ]);
  }
  function updateLocation(i: number, key: keyof LocationDraft, value: string) {
    setLocations((l) =>
      l.map((row, idx) => (idx === i ? { ...row, [key]: value } : row))
    );
  }
  function removeLocation(i: number) {
    setLocations((l) => l.filter((_, idx) => idx !== i));
  }

  function addRouteItem() {
    updateEvent("routeItems", [...event.routeItems, { code: "", label: "" }]);
  }
  function updateRouteItem(i: number, key: "code" | "label", value: string) {
    updateEvent(
      "routeItems",
      event.routeItems.map((r, idx) => (idx === i ? { ...r, [key]: value } : r))
    );
  }
  function removeRouteItem(i: number) {
    updateEvent(
      "routeItems",
      event.routeItems.filter((_, idx) => idx !== i)
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const eventPayload = {
        slug: event.slug,
        name: event.name,
        sport: event.sport,
        status: event.status,
        eyebrow: event.eyebrow,
        tagline: event.tagline,
        description: event.description,
        hero_image: event.heroImage || null,
        sale_image: event.saleImage || null,
        route_items: event.routeItems,
      };

      let eventId = event.id;

      if (isEdit) {
        const { error: updateError } = await supabase
          .from("events")
          .update(eventPayload)
          .eq("id", eventId);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("events")
          .insert(eventPayload)
          .select("id")
          .single();
        if (insertError) throw insertError;
        eventId = inserted.id;
      }

      // Plans: update rows that already have an id, insert rows that
      // don't, and delete only rows the admin explicitly removed from
      // the list — never a blanket delete-and-reinsert, since that
      // would break anything referencing the old plan rows.
      const existingPlanIds = (initialPlans ?? []).map((p) => p.id).filter(Boolean);
      const keptPlanIds = plans.map((p) => p.id).filter(Boolean);
      const removedPlanIds = existingPlanIds.filter((id) => !keptPlanIds.includes(id));

      if (removedPlanIds.length > 0) {
        await supabase.from("plans").delete().in("id", removedPlanIds as string[]);
      }

      for (const p of plans) {
        if (!p.sku || !p.name) continue;
        const payload = {
          event_id: eventId,
          sku: p.sku,
          name: p.name,
          description: p.description,
          features: p.features.split("\n").map((f) => f.trim()).filter(Boolean),
          price: p.price ? Number(p.price) : null,
        };
        if (p.id) {
          const { error: planError } = await supabase
            .from("plans")
            .update(payload)
            .eq("id", p.id);
          if (planError) throw planError;
        } else {
          const { error: planError } = await supabase.from("plans").insert(payload);
          if (planError) throw planError;
        }
      }

      // Locations: same update-in-place approach — this is the critical
      // one, since deleting and reinserting a location would cascade-
      // delete its service_categories and location_services via the
      // foreign key, wiping out any pricing already configured for it.
      const existingLocationIds = (initialLocations ?? [])
        .map((l) => l.id)
        .filter(Boolean);
      const keptLocationIds = locations.map((l) => l.id).filter(Boolean);
      const removedLocationIds = existingLocationIds.filter(
        (id) => !keptLocationIds.includes(id)
      );

      if (removedLocationIds.length > 0) {
        await supabase
          .from("event_locations")
          .delete()
          .in("id", removedLocationIds as string[]);
      }

      for (const l of locations) {
        if (!l.slug || !l.name) continue;
        const payload = {
          event_id: eventId,
          slug: l.slug,
          name: l.name,
          description: l.description,
          image: l.image || null,
          base_price: l.basePrice ? Number(l.basePrice) : 0,
          asset_product_sku: l.assetProductSku || null,
          asset_city_slug: l.assetCitySlug || null,
        };
        if (l.id) {
          const { error: locationError } = await supabase
            .from("event_locations")
            .update(payload)
            .eq("id", l.id);
          if (locationError) throw locationError;
        } else {
          const { error: locationError } = await supabase
            .from("event_locations")
            .insert(payload);
          if (locationError) throw locationError;
        }
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong saving this event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded bg-[#E8002D]/20 p-3 text-sm text-[#E8002D]">
          {error}
        </p>
      )}

      {/* core event fields */}
      <section className="rounded-xl bg-[#142050] p-6">
        <h2 className="font-bold text-lg">Event Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Slug (url-safe, e.g. us-open)">
            <input
              value={event.slug}
              onChange={(e) => updateEvent("slug", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Name">
            <input
              value={event.name}
              onChange={(e) => updateEvent("name", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Sport">
            <input
              value={event.sport}
              onChange={(e) => updateEvent("sport", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Status">
            <select
              value={event.status}
              onChange={(e) =>
                updateEvent("status", e.target.value as "upcoming" | "past")
              }
              className="input"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </Field>
          <Field label="Eyebrow (e.g. USA · 2026 · US OPEN TRAVEL)">
            <input
              value={event.eyebrow}
              onChange={(e) => updateEvent("eyebrow", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Hero Image Path">
            <input
              value={event.heroImage}
              onChange={(e) => updateEvent("heroImage", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Sale/Product Image Path (shown in 'Inside the Planner')">
            <input
              value={event.saleImage}
              onChange={(e) => updateEvent("saleImage", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Tagline" full>
            <input
              value={event.tagline}
              onChange={(e) => updateEvent("tagline", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Description" full>
            <textarea
              value={event.description}
              onChange={(e) => updateEvent("description", e.target.value)}
              rows={3}
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* route items */}
      <section className="rounded-xl bg-[#142050] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Route Strip (hero footer codes)</h2>
          <button onClick={addRouteItem} className="btn-secondary">
            + Add Code
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {event.routeItems.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="CODE"
                value={r.code}
                onChange={(e) => updateRouteItem(i, "code", e.target.value)}
                className="input w-24"
              />
              <input
                placeholder="Label"
                value={r.label}
                onChange={(e) => updateRouteItem(i, "label", e.target.value)}
                className="input flex-1"
              />
              <button onClick={() => removeRouteItem(i)} className="btn-remove">
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* plans */}
      <section className="rounded-xl bg-[#142050] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Plans</h2>
          <button onClick={addPlan} className="btn-secondary">
            + Add Plan
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {plans.map((p, i) => (
            <div key={i} className="rounded-lg bg-[#0D1B4B] p-4">
              <div className="flex justify-end">
                <button onClick={() => removePlan(i)} className="btn-remove">
                  Remove Plan
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="SKU">
                  <input
                    value={p.sku}
                    onChange={(e) => updatePlan(i, "sku", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Name">
                  <input
                    value={p.name}
                    onChange={(e) => updatePlan(i, "name", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Price (USD, optional)">
                  <input
                    value={p.price}
                    onChange={(e) => updatePlan(i, "price", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Description" full>
                  <textarea
                    value={p.description}
                    onChange={(e) => updatePlan(i, "description", e.target.value)}
                    rows={2}
                    className="input"
                  />
                </Field>
                <Field label="Features (one per line)" full>
                  <textarea
                    value={p.features}
                    onChange={(e) => updatePlan(i, "features", e.target.value)}
                    rows={4}
                    className="input"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* locations */}
      <section className="rounded-xl bg-[#142050] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Locations</h2>
          <button onClick={addLocation} className="btn-secondary">
            + Add Location
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {locations.map((l, i) => (
            <div key={i} className="rounded-lg bg-[#0D1B4B] p-4">
              <div className="flex justify-end">
                <button onClick={() => removeLocation(i)} className="btn-remove">
                  Remove Location
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Slug">
                  <input
                    value={l.slug}
                    onChange={(e) => updateLocation(i, "slug", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Name">
                  <input
                    value={l.name}
                    onChange={(e) => updateLocation(i, "name", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Base Guide Price (USD)">
                  <input
                    value={l.basePrice}
                    onChange={(e) => updateLocation(i, "basePrice", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Image Path">
                  <input
                    value={l.image}
                    onChange={(e) => updateLocation(i, "image", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Delivery: Asset Product SKU (from download_assets)">
                  <input
                    value={l.assetProductSku}
                    onChange={(e) => updateLocation(i, "assetProductSku", e.target.value)}
                    placeholder="e.g. Ventariq_US_Open_2026"
                    className="input"
                  />
                </Field>
                <Field label="Delivery: Asset City Slug (from download_assets)">
                  <input
                    value={l.assetCitySlug}
                    onChange={(e) => updateLocation(i, "assetCitySlug", e.target.value)}
                    placeholder="e.g. us"
                    className="input"
                  />
                </Field>
                <Field label="Description" full>
                  <textarea
                    value={l.description}
                    onChange={(e) => updateLocation(i, "description", e.target.value)}
                    rows={2}
                    className="input"
                  />
                </Field>
              </div>
              {l.id && (
                <a
                  href={`/admin/locations/${l.id}/pricing`}
                  className="mt-3 inline-block font-mono text-xs tracking-widest text-[#F5B301] hover:text-white"
                >
                  MANAGE CATEGORIES & ADD-ON PRICING →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-[#E8002D] px-7 py-3 font-bold disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          background: #0d1b4b;
          padding: 0.6rem 0.75rem;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.875rem;
        }
        .btn-secondary {
          border-radius: 0.375rem;
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.4rem 0.9rem;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
        }
        .btn-remove {
          font-size: 0.75rem;
          color: #e8002d;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block text-sm ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block font-mono text-[11px] tracking-widest text-white/50">
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  );
}
