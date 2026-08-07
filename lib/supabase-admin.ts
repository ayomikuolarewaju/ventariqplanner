// lib/supabase-admin.ts
//
// SERVER-ONLY. Uses the service role key, which bypasses RLS entirely —
// never import this in a client component, never expose the key with a
// NEXT_PUBLIC_ prefix. Used only for admin-only server actions like
// creating new admin users.
//
// Add to .env (server-only, no NEXT_PUBLIC_ prefix):
//   SUPABASE_SERVICE_ROLE_KEY=...
// Find it in Supabase Dashboard → Project Settings → API → service_role key.

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
