"use client";

import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "not_admin"
      ? "That account doesn't have admin access."
      : ""
  );

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!adminRow) {
      setError("That account doesn't have admin access.");
      await supabase.auth.signOut();
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="min-h-screen bg-[#0D1B4B] flex items-center justify-center">
      <div className="bg-[#142050] p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

        <input
          placeholder="Email"
          className="w-full p-3 text-black rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 text-black rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="mt-5 bg-[#E8002D] px-6 py-3 rounded font-bold w-full"
        >
          Login
        </button>

        <p className="text-red-400 mt-3">{error}</p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
