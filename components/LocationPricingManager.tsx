"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * LocationPricingManager — ComfortLifeUS Admin
 *
 * Manages service_categories for one location: name + optional
 * addon_price (null = included in the base guide price). Each category
 * can also have its individual location_services items added inline.
 */

type ServiceDraft = { id?: string; name: string; description: string };
type CategoryDraft = {
  id?: string;
  name: string;
  addonPrice: string; // empty = included in base price
  services: ServiceDraft[];
};

export default function LocationPricingManager({
  locationId,
  initialCategories,
}: {
  locationId: string;
  initialCategories: CategoryDraft[];
}) {
  const [categories, setCategories] = useState<CategoryDraft[]>(initialCategories);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addCategory() {
    setCategories((c) => [...c, { name: "", addonPrice: "", services: [] }]);
  }
  function updateCategory(i: number, key: "name" | "addonPrice", value: string) {
    setCategories((c) =>
      c.map((row, idx) => (idx === i ? { ...row, [key]: value } : row))
    );
  }
  function removeCategory(i: number) {
    setCategories((c) => c.filter((_, idx) => idx !== i));
  }

  function addService(catIndex: number) {
    setCategories((c) =>
      c.map((row, idx) =>
        idx === catIndex
          ? { ...row, services: [...row.services, { name: "", description: "" }] }
          : row
      )
    );
  }
  function updateService(
    catIndex: number,
    svcIndex: number,
    key: "name" | "description",
    value: string
  ) {
    setCategories((c) =>
      c.map((row, idx) =>
        idx === catIndex
          ? {
              ...row,
              services: row.services.map((s, sIdx) =>
                sIdx === svcIndex ? { ...s, [key]: value } : s
              ),
            }
          : row
      )
    );
  }
  function removeService(catIndex: number, svcIndex: number) {
    setCategories((c) =>
      c.map((row, idx) =>
        idx === catIndex
          ? { ...row, services: row.services.filter((_, sIdx) => sIdx !== svcIndex) }
          : row
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const existingCategoryIds = initialCategories.map((c) => c.id).filter(Boolean);
      const keptCategoryIds = categories.map((c) => c.id).filter(Boolean);
      const removedCategoryIds = existingCategoryIds.filter(
        (id) => !keptCategoryIds.includes(id)
      );

      if (removedCategoryIds.length > 0) {
        await supabase
          .from("service_categories")
          .delete()
          .in("id", removedCategoryIds as string[]);
      }

      for (const cat of categories) {
        if (!cat.name) continue;

        let categoryId = cat.id;
        const catPayload = {
          location_id: locationId,
          name: cat.name,
          addon_price: cat.addonPrice ? Number(cat.addonPrice) : null,
        };

        if (categoryId) {
          const { error: catError } = await supabase
            .from("service_categories")
            .update(catPayload)
            .eq("id", categoryId);
          if (catError) throw catError;
        } else {
          const { data: inserted, error: catError } = await supabase
            .from("service_categories")
            .insert(catPayload)
            .select("id")
            .single();
          if (catError) throw catError;
          categoryId = inserted.id;
        }

        // services within this category — same update-in-place pattern
        const initialCat = initialCategories.find((c) => c.id === cat.id);
        const existingServiceIds = (initialCat?.services ?? [])
          .map((s) => s.id)
          .filter(Boolean);
        const keptServiceIds = cat.services.map((s) => s.id).filter(Boolean);
        const removedServiceIds = existingServiceIds.filter(
          (id) => !keptServiceIds.includes(id)
        );

        if (removedServiceIds.length > 0) {
          await supabase
            .from("location_services")
            .delete()
            .in("id", removedServiceIds as string[]);
        }

        for (const svc of cat.services) {
          if (!svc.name) continue;
          const svcPayload = {
            category_id: categoryId,
            name: svc.name,
            description: svc.description,
          };
          if (svc.id) {
            const { error: svcError } = await supabase
              .from("location_services")
              .update(svcPayload)
              .eq("id", svc.id);
            if (svcError) throw svcError;
          } else {
            const { error: svcError } = await supabase
              .from("location_services")
              .insert(svcPayload);
            if (svcError) throw svcError;
          }
        }
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong saving pricing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded bg-[#E8002D]/20 p-3 text-sm text-[#E8002D]">
          {error}
        </p>
      )}

      {categories.map((cat, i) => (
        <div key={i} className="rounded-xl bg-[#142050] p-6">
          <div className="flex items-center justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-mono text-[11px] tracking-widest text-white/50">
                  CATEGORY NAME
                </span>
                <input
                  value={cat.name}
                  onChange={(e) => updateCategory(i, "name", e.target.value)}
                  placeholder="e.g. Hotels"
                  className="w-full rounded bg-[#0D1B4B] px-3 py-2 text-sm text-white ring-1 ring-white/10"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-mono text-[11px] tracking-widest text-white/50">
                  ADD-ON PRICE (USD, leave blank if included in base guide)
                </span>
                <input
                  value={cat.addonPrice}
                  onChange={(e) => updateCategory(i, "addonPrice", e.target.value)}
                  placeholder="Included in base"
                  className="w-full rounded bg-[#0D1B4B] px-3 py-2 text-sm text-white ring-1 ring-white/10"
                />
              </label>
            </div>
            <button
              onClick={() => removeCategory(i)}
              className="ml-4 text-xs text-[#E8002D]"
            >
              Remove Category
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {cat.services.map((svc, si) => (
              <div key={si} className="flex gap-2">
                <input
                  value={svc.name}
                  onChange={(e) => updateService(i, si, "name", e.target.value)}
                  placeholder="Service name"
                  className="w-1/3 rounded bg-[#0D1B4B] px-3 py-2 text-sm text-white ring-1 ring-white/10"
                />
                <input
                  value={svc.description}
                  onChange={(e) => updateService(i, si, "description", e.target.value)}
                  placeholder="Description"
                  className="flex-1 rounded bg-[#0D1B4B] px-3 py-2 text-sm text-white ring-1 ring-white/10"
                />
                <button
                  onClick={() => removeService(i, si)}
                  className="text-xs text-[#E8002D]"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addService(i)}
              className="font-mono text-xs tracking-widest text-white/60 hover:text-white"
            >
              + ADD SERVICE
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addCategory}
        className="rounded border border-white/25 px-5 py-2 text-sm font-bold"
      >
        + Add Category
      </button>

      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-[#E8002D] px-7 py-3 font-bold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Pricing"}
        </button>
      </div>
    </div>
  );
}
