// "use client";

// import { useState } from "react";

// declare global {
//   interface Window {
//     fbq?: (...args: any[]) => void;
//   }
// }

// /**
//  * Fires InitiateCheckout the moment someone clicks Buy -- before the
//  * network request even starts, since this event represents intent,
//  * not a confirmed outcome. Waits briefly for fbq to exist if the pixel
//  * script hasn't finished loading yet, rather than silently giving up
//  * the instant it's checked (the bug that likely caused the missing
//  * client-side Purchase events on the success page).
//  */
// function fireInitiateCheckout(eventId: string, retriesLeft = 10) {
//   if (typeof window.fbq === "function") {
//     window.fbq("track", "InitiateCheckout", {}, { eventID: eventId });
//     return;
//   }
//   if (retriesLeft > 0) {
//     setTimeout(() => fireInitiateCheckout(eventId, retriesLeft - 1), 300);
//   }
// }

// export default function PurchaseButton({ sku }: { sku?: string }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handleBuyClick() {
//     setLoading(true);
//     setError("");

//     const eventId = crypto.randomUUID();
//     fireInitiateCheckout(eventId);

//     try {
//       const res = await fetch("/api/checkout", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sku, checkoutEventId: eventId }),
//       });
//       const data = await res.json();

//       if (!res.ok || !data.url) {
//         setError(data.error ?? "Could not start checkout.");
//         return;
//       }

//       window.location.href = data.url;
//     } catch {
//       setError("Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       <button
//         onClick={handleBuyClick}
//         disabled={loading}
//         className="rounded-[5px] bg-[#B8863B] px-6 py-3 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d] disabled:opacity-50"
//       >
//         {loading ? "…" : "Get This Guide"}
//       </button>

//       {error && <p className="mt-2 text-sm text-[#8C1C2B]">{error}</p>}
//     </div>
//   );
// }

"use client";

import { useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function fireInitiateCheckout(
  eventId: string,
  sku?: string,
  retriesLeft = 10
) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function") {
    const eventData = {
      content_ids: sku ? [sku] : [],
      content_type: "product",
    };

    console.log("=================================");
    console.log("📊 META INITIATE CHECKOUT");
    console.log("🆔 Event ID:", eventId);
    console.log("📦 SKU:", sku);
    console.log("📦 Data:", eventData);
    console.log("=================================");

    window.fbq(
      "track",
      "InitiateCheckout",
      eventData,
      {
        eventID: eventId,
      }
    );

    console.log("✅ InitiateCheckout sent to fbq");

    return;
  }

  if (retriesLeft > 0) {
    console.log(
      `⏳ Waiting for Meta Pixel... ${retriesLeft} attempts remaining`
    );

    setTimeout(() => {
      fireInitiateCheckout(eventId, sku, retriesLeft - 1);
    }, 300);

    return;
  }

  console.error("❌ Meta Pixel was not available");
}

export default function PurchaseButton({ sku }: { sku?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuyClick() {
    if (loading) return;

    setLoading(true);
    setError("");

    const eventId = crypto.randomUUID();

    console.log("🛒 PURCHASE BUTTON CLICKED");
    console.log("🆔 Checkout Event ID:", eventId);
    console.log("📦 SKU:", sku);

    // Browser-side Meta event
    fireInitiateCheckout(eventId, sku);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku,
          checkoutEventId: eventId,
        }),
      });

      const data = await res.json();

      console.log("💳 Checkout API response:", data);

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }

      console.log("🚀 Redirecting to Stripe...");
      console.log("🆔 Event ID passed to server:", eventId);

      window.location.href = data.url;
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setError("Something went wrong. Try again.");
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

      {error && (
        <p className="mt-2 text-sm text-[#8C1C2B]">
          {error}
        </p>
      )}
    </div>
  );
}

