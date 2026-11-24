/*
 * Supabase connection (database, realtime). Nobody logs in on the site (owner, 2026-11-24).
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

// Logins from when the site had accounts: forget them, so an old one can't attach itself to an order
try {
  localStorage.removeItem("shweet-brew-auth");
} catch {
  // storage blocked: nothing saved there either
}

let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL!, SUPABASE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  );
  return clientPromise;
}
