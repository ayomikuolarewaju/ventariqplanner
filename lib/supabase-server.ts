// lib/supabase-server.ts
//
// Use this in server components and route handlers that need to know
// who's logged in (admin pages, anything gated by auth). Keep your
// existing lib/supabase.ts as the plain browser client for public
// reads (cities, products) that don't need a session.
//
// npm install @supabase/ssr

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component during render — safe to
            // ignore since middleware refreshes the session on every request
          }
        },
      },
    }
  );
}
