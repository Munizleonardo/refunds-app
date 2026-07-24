import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Uses the service role key, which bypasses RLS. Must only ever be
 * imported from server-only code (Server Components, route handlers).
 * The `server-only` import above makes any accidental Client Component
 * import fail the build instead of leaking the key to the browser.
 */
export function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas. Verifique o .env.local."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
