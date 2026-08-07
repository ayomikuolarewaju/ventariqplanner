"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * AuthModal — ComfortLifeUS
 *
 * Only ever shown at the moment of purchase, not as a browsing gate.
 * Toggles between sign up and sign in. On success, hands control back
 * to whoever opened it (PurchaseButton) to continue checkout.
 *
 * IMPORTANT: if your Supabase project has "Confirm email" enabled
 * (Authentication → Settings), signUp() won't return an active session
 * until the user clicks the confirmation link in their inbox — so
 * onAuthenticated() would fire but checkout would fail because there's
 * no session yet. For a smooth guest-to-buyer flow, either disable email
 * confirmation for this project, or switch to a magic-link flow instead.
 */

export default function AuthModal({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void;
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onAuthenticated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-[#142050] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-xs tracking-widest text-[#F5B301]">
          {mode === "signup" ? "ONE STEP BEFORE CHECKOUT" : "WELCOME BACK"}
        </p>
        <h2 className="mt-2 font-display text-2xl tracking-wide">
          {mode === "signup" ? "Create your account" : "Sign in to continue"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded bg-[#0D1B4B] px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded bg-[#0D1B4B] px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
          />

          {error && <p className="text-sm text-[#E8002D]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#E8002D] px-6 py-3 font-bold disabled:opacity-50"
          >
            {loading
              ? "…"
              : mode === "signup"
              ? "Create Account & Continue"
              : "Sign In & Continue"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-4 block text-xs text-white/60 hover:text-white"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
        <button
          onClick={onClose}
          className="mt-2 block text-xs text-white/40 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
