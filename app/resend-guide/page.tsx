"use client";

import { useState } from "react";

export default function ResendGuidePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    await fetch("/api/orders/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setStatus("sent");
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-[11px] border border-[#D8D2C2] bg-white p-8">
        <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#8C6423]">
          Lost Your Download Link?
        </p>
        <h1 className="font-serif text-2xl font-bold text-[#152238]">
          Get your guides resent.
        </h1>

        {status === "sent" ? (
          <p className="mt-5 text-[14.5px] text-[#5A6472]">
            If we found any guides under that email, fresh download
            links are on their way — check your inbox (and spam folder)
            in the next few minutes.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5">
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#5A6472]">
              Email used at checkout
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[5px] border border-[#D8D2C2] px-4 py-3 text-[#152238] outline-none focus:border-[#B8863B]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-4 w-full rounded-[5px] bg-[#B8863B] px-6 py-3 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d] disabled:opacity-50"
            >
              {status === "loading" ? "Sending…" : "Resend My Guides"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
