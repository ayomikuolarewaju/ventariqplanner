"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

type ResetState = "idle" | "resetting" | "done" | "error";

export default function ResetPurchaseDownloadsButton({
  purchaseId,
}: {
  purchaseId: string;
}) {
  const [state, setState] = useState<ResetState>("idle");
  const [message, setMessage] = useState("");

  async function resetAccess() {
    if (
      state === "resetting" ||
      !window.confirm("Reset this purchase to three downloads for the next seven days?")
    ) {
      return;
    }

    setState("resetting");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/purchases/${encodeURIComponent(purchaseId)}/reset-downloads`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not reset download access");
      }

      setState("done");
      setMessage("Access reset");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not reset download access");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={resetAccess}
        disabled={state === "resetting"}
        className="inline-flex min-h-9 items-center gap-2 border border-white/15 px-3 text-xs font-semibold text-white/75 transition-colors hover:border-[#B8863B] hover:text-white disabled:cursor-wait disabled:opacity-50"
      >
        <RotateCcw size={14} aria-hidden="true" />
        {state === "resetting" ? "Resetting…" : "Reset download access"}
      </button>
      {message && (
        <span className={`text-xs ${state === "error" ? "text-red-300" : "text-emerald-200"}`}>
          {message}
        </span>
      )}
    </div>
  );
}