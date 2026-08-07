"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { EASE_OUT } from "@/lib/motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sku = searchParams.get("sku");
  const redirect = searchParams.get("redirect") || "/dashboard";

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

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    if (sku) {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku }),
        });
        const data = await res.json();

        if (!res.ok || !data.url) {
          setLoading(false);
          setError(data.error ?? "Signed in, but couldn't start checkout.");
          return;
        }

        window.location.href = data.url;
        return;
      } catch {
        setLoading(false);
        setError("Signed in, but couldn't start checkout. Try again.");
        return;
      }
    }

    router.push(redirect);
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="w-full max-w-md rounded-xl bg-[#142050] p-8"
      >
        <p className="font-mono text-xs tracking-widest text-[#F5B301]">
          {sku ? "ONE STEP BEFORE CHECKOUT" : "WELCOME"}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-wide">
          {mode === "signup" ? "Create your account" : "Sign in to continue"}
        </h1>

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
              ? sku
                ? "Create Account & Continue to Payment"
                : "Create Account"
              : sku
              ? "Sign In & Continue to Payment"
              : "Sign In"}
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
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
