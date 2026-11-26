/*
 * Supabase connection. Nobody logs in on the site (owner, 2026-11-24), so the site only reads the
 * catalogue and calls four database functions: plain HTTPS requests to Supabase's REST API, without
 * the 230 KB client library (2026-11-26).
 *
 * Configured by VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in `.env`
 * (see .env.example). Without them the site shows the built-in product list and
 * orders can't be placed.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Logins from when the site had accounts: forget them, so an old one can't attach itself to an order
try {
  localStorage.removeItem("shweet-brew-auth");
} catch {
  // storage blocked: nothing saved there either
}

/** What a failed request says: `message` carries the database's error, e.g. "OUT_OF_STOCK:biltong-traditional:250g:3" */
export type DbError = { message: string; code?: string; status?: number };
export type DbResult<T> = { data: T | null; error: DbError | null };

async function request<T>(path: string, init: RequestInit = {}): Promise<DbResult<T>> {
  if (!isSupabaseConfigured) return { data: null, error: { message: "Supabase is not configured (.env)" } };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: SUPABASE_KEY!, Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) return { data: null, error: { message: body?.message || `HTTP ${res.status}`, code: body?.code, status: res.status } };
    return { data: body as T, error: null };
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Read rows: `select("categories", "id,name_en,products(...)", "is_active=eq.true")` */
export function select<T>(table: string, columns: string, filter = ""): Promise<DbResult<T>> {
  const query = `select=${encodeURIComponent(columns.replace(/\s+/g, ""))}${filter ? `&${filter}` : ""}`;
  return request<T>(`${table}?${query}`);
}

/** Call a database function (place_order, claim_payment, set_payment_method) */
export function rpc<T>(fn: string, args: Record<string, unknown>): Promise<DbResult<T>> {
  return request<T>(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
}
