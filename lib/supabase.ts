// lib/supabase.ts
//
// MUST be createBrowserClient from @supabase/ssr, not createClient from
// @supabase/supabase-js. The plain client stores the session in
// localStorage, which no server-side code (middleware, API routes,
// server components) can ever read -- this was the root cause of both
// the admin login redirect loop and this checkout 401.
 
import { createBrowserClient } from "@supabase/ssr";
 
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);