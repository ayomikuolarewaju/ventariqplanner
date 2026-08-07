"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch("/api/admin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setStatus("idle");
    setEmail("");
    setPassword("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-xl bg-[#142050] p-6"
    >
      <h2 className="text-lg font-bold">Add New Admin</h2>

      {error && (
        <p className="rounded bg-[#E8002D]/20 p-3 text-sm text-[#E8002D]">
          {error}
        </p>
      )}

      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded bg-[#0D1B4B] px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-white/30"
      />
      <input
        type="password"
        required
        placeholder="Temporary password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded bg-[#0D1B4B] px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-white/30"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-[#E8002D] px-6 py-3 font-bold disabled:opacity-50"
      >
        {status === "loading" ? "Creating…" : "Create Admin"}
      </button>

      <p className="text-xs text-white/40">
        They should change this password after their first login.
      </p>
    </form>
  );
}
