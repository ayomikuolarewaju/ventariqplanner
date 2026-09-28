"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function ResendOrderButton({
  orderId,
}: {
  orderId: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function parseJsonResponse(response: Response) {
    const raw = await response.text();
    if (!raw) return {};

    try {
      return JSON.parse(raw);
    } catch {
      return { error: raw || `Request failed (${response.status})` };
    }
  }

  async function resendPlanner() {
    setState("sending");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/resend`, {
        method: "POST",
      });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Could not resend planner");
      }

      setState("sent");
      setMessage("Sent");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not resend planner");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={resendPlanner}
        disabled={state === "sending" || state === "sent"}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8863B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Mail size={14} aria-hidden="true" />
        {state === "sending" ? "Sending…" : state === "sent" ? "Sent" : "Resend planner"}
      </button>
      {state === "error" && <span className="max-w-48 text-xs text-red-300">{message}</span>}
    </div>
  );
}