/*
 * Supabase connection (database, auth, realtime).
 *
 * Configured by VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env` (see
 * .env.example). When they're missing the site keeps working on the built-in
 * product list and sends orders to WhatsApp, exactly as before.
 *
 * The client library is loaded on demand, so it never delays the first paint.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "shweet-brew-auth",
      },
    })
  );
  return clientPromise;
}
