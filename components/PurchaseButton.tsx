"use client";

import { useState } from "react";

export default function PurchaseButton({ sku }: { sku: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuyClick() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleBuyClick}
        disabled={loading}
        className="rounded-[5px] bg-[#B8863B] px-6 py-3 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d] disabled:opacity-50"
      >
        {loading ? "…" : "Get This Guide"}
      </button>

      {error && <p className="mt-2 text-sm text-[#8C1C2B]">{error}</p>}
    </div>
  );
}
