/*
 * Supabase connection (database, auth, realtime).
 *
 * Configured by VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in `.env`
 * (see .env.example). Without them the site shows the built-in product list and
 * orders can't be placed.
 *
 * The client library is loaded on demand, so it never delays the first paint.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** For the few plain fetches that don't go through the client (e.g. which login providers are on) */
export const supabasePublic = { url: SUPABASE_URL ?? "", key: SUPABASE_KEY ?? "" };

let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL!, SUPABASE_KEY!, {
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
