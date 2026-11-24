// Local stand-in for Supabase (REST + the Auth endpoints the login popup uses),
// backed by PGlite with the real migrations + seed. Local testing only.
//   node mock-auth.mjs <repo> <port> [confirm]
// "confirm" = new sign-ups must confirm their email first (Supabase's default).
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import http from "node:http";
import { randomUUID } from "node:crypto";

const [root, portArg, mode] = process.argv.slice(2);
const port = Number(portArg || 54399);
const CONFIRM = mode === "confirm";
const db = new PGlite();
await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, phone text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select current_setting('request.jwt.claim.role', true) $$;
grant usage on schema auth to anon, authenticated; grant execute on all functions in schema auth to anon, authenticated;
create publication supabase_realtime;
`);
for (const f of readdirSync(`${root}/supabase/migrations`).filter((f) => f.endsWith(".sql") && !f.includes("product_images")).sort())
  await db.exec(readFileSync(`${root}/supabase/migrations/${f}`, "utf8"));
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8"));

// Accounts: email -> { id, password, confirmed, meta }
const accounts = new Map();
async function createUser(email, password, meta, confirmed) {
  const id = (await db.query(`insert into auth.users (email, raw_user_meta_data, email_confirmed_at) values ($1, $2, $3) returning id`, [email, JSON.stringify(meta), confirmed ? new Date().toISOString() : null])).rows[0].id;
  accounts.set(email.toLowerCase(), { id, password, confirmed, meta });
  return id;
}
await createUser("dana@example.test", "biltong123", { first_name: "Dana", last_name: "Levi", full_name: "Dana Levi" }, true);
await db.query(`update public.profiles set phone = '054-555-1234', city = 'Tel Aviv', street = 'Dizengoff 10' where email = 'dana@example.test'`);
await createUser("pending@example.test", "biltong123", { first_name: "Pat" }, false);

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tokens = new Map(); // access token -> user id
function session(email) {
  const a = accounts.get(email.toLowerCase());
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const access_token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: a.id, email, role: "authenticated", exp, aud: "authenticated" })}.sig`;
  tokens.set(access_token, a.id);
  return { access_token, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: randomUUID(), user: user(email) };
}
const user = (email) => {
  const a = accounts.get(email.toLowerCase());
  return { id: a.id, aud: "authenticated", role: "authenticated", email, email_confirmed_at: a.confirmed ? new Date().toISOString() : null, user_metadata: a.meta, app_metadata: { provider: "email" }, identities: [{ id: a.id, provider: "email" }], created_at: new Date().toISOString() };
};

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS", "Content-Type": "application/json" };
const send = (res, status, body) => { res.writeHead(status, cors); res.end(JSON.stringify(body)); };
const authErr = (res, status, code, msg) => send(res, status, { code: status, error_code: code, msg });

async function asRole(role, uid, fn) {
  await db.exec("begin");
  try {
    await db.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)`, [uid ?? "", role]);
    await db.exec(`set local role ${role}`);
    const r = await fn();
    await db.exec("commit");
    return r;
  } catch (e) { await db.exec("rollback"); throw e; }
}

// Like Supabase's Database Webhook on orders/INSERT: after an order is saved,
// POST it to the order-emails function if ORDER_WEBHOOK_URL is set
// (see order-emails-local.mjs). Fire-and-forget, like pg_net.
async function fireOrderWebhook(orderId) {
  const target = process.env.ORDER_WEBHOOK_URL;
  if (!target || !orderId) return;
  try {
    const record = (await db.query(`select * from public.orders where id = $1`, [orderId])).rows[0];
    const r = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": process.env.ORDER_WEBHOOK_SECRET || "" },
      body: JSON.stringify({ type: "INSERT", table: "orders", schema: "public", record, old_record: null }),
    });
    console.log("  order webhook →", r.status, await r.text());
  } catch (e) { console.log("  order webhook failed:", e.message); }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  let body = ""; for await (const c of req) body += c;
  const json = body ? JSON.parse(body) : {};
  const bearer = (req.headers.authorization || "").replace(/^Bearer /, "");
  const uid = tokens.get(bearer) ?? null;
  console.log(req.method, url.pathname + url.search, uid ? "(signed in)" : "");
  try {
    // ---- Auth ----
    if (url.pathname === "/auth/v1/settings") return send(res, 200, { external: { email: true, google: true }, mailer_autoconfirm: !CONFIRM });
    if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "password") {
      const a = accounts.get(String(json.email).toLowerCase());
      if (!a || a.password !== json.password) return authErr(res, 400, "invalid_credentials", "Invalid login credentials");
      if (!a.confirmed) return authErr(res, 400, "email_not_confirmed", "Email not confirmed");
      return send(res, 200, session(json.email));
    }
    if (url.pathname === "/auth/v1/signup") {
      if (accounts.has(String(json.email).toLowerCase())) return send(res, 200, { ...user(json.email), identities: [] });
      if (String(json.password).length < 8) return authErr(res, 422, "weak_password", "Password should be at least 8 characters");
      await createUser(json.email, json.password, json.data || {}, !CONFIRM);
      return send(res, 200, CONFIRM ? user(json.email) : session(json.email));
    }
    // 6-digit email codes: the code is always 123456 here
    if (url.pathname === "/auth/v1/otp") {
      const key = String(json.email).toLowerCase();
      if (!accounts.has(key)) {
        if (!json.create_user) return authErr(res, 422, "otp_disabled", "Signups not allowed for otp");
        await createUser(json.email, null, json.data || {}, false);
      }
      console.log("  (code 123456 emailed to", json.email + ")");
      return send(res, 200, {});
    }
    if (url.pathname === "/auth/v1/verify") {
      const a = accounts.get(String(json.email).toLowerCase());
      if (!a || json.token !== "123456") return authErr(res, 403, "otp_expired", "Token has expired or is invalid");
      a.confirmed = true;
      await db.query(`update auth.users set email_confirmed_at = now() where id = $1`, [a.id]);
      return send(res, 200, session(json.email));
    }
    if (url.pathname === "/auth/v1/recover" || url.pathname === "/auth/v1/resend") { console.log("  (email sent to", json.email + ")"); return send(res, 200, {}); }
    if (url.pathname === "/auth/v1/logout") { tokens.delete(bearer); res.writeHead(204, cors); return res.end(); }
    if (url.pathname === "/auth/v1/user") {
      const email = [...accounts].find(([, a]) => a.id === uid)?.[0];
      if (!email) return authErr(res, 401, "bad_jwt", "invalid");
      if (req.method === "PUT" && json.password) accounts.get(email).password = json.password;
      return send(res, 200, user(email));
    }
    // ---- REST ----
    if (url.pathname === "/rest/v1/categories") {
      const r = await db.query(`select coalesce(json_agg(c), '[]'::json) data from (select cat.id, cat.name_en, cat.name_he, cat.description_en, cat.image, cat.sort_order,
        (select coalesce(json_agg(p), '[]'::json) from (select pr.*, (select coalesce(json_agg(s), '[]'::json) from public.product_sizes s where s.product_id = pr.id) product_sizes
         from public.products pr where pr.category_id = cat.id) p) products from public.categories cat where cat.is_active) c`);
      return send(res, 200, r.rows[0].data);
    }
    if (url.pathname === "/rest/v1/profiles" && req.method === "PATCH") {
      const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
      const cols = Object.keys(json);
      const sets = cols.map((c, i) => `${c} = $${i + 2}`).join(", ");
      await asRole("authenticated", uid, () => db.query(`update public.profiles set ${sets} where id = $1`, [id, ...cols.map((c) => json[c])]));
      console.log("  profile saved:", JSON.stringify(json));
      res.writeHead(204, cors); return res.end();
    }
    if (url.pathname === "/rest/v1/profiles") {
      const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
      const rows = (await asRole(uid ? "authenticated" : "anon", uid, () => db.query(`select id, email, full_name, phone, role, city, street, apartment, default_zone_id from public.profiles where id = $1`, [id]))).rows;
      const single = String(req.headers.accept || "").includes("vnd.pgrst.object");
      return single ? (rows[0] ? send(res, 200, rows[0]) : send(res, 406, { code: "PGRST116", message: "0 rows" })) : send(res, 200, rows);
    }
    // Read by the order-emails function with the service key (no RLS)
    if (url.pathname === "/rest/v1/order_items" && req.method === "GET") {
      const id = (url.searchParams.get("order_id") || "").replace(/^eq\./, "");
      const r = await db.query(`select product_name, category_name, size_label, unit_price, quantity, line_total from public.order_items where order_id = $1 order by id`, [id]);
      return send(res, 200, r.rows);
    }
    const rpc = url.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
    if (rpc) {
      try {
        const args = rpc[1] === "email_has_account" ? [json.p_email] : [JSON.stringify(json.p_order)];
        const sql = rpc[1] === "email_has_account" ? `select public.email_has_account($1) r` : `select public.place_order($1::jsonb) r`;
        const r = await asRole(uid ? "authenticated" : "anon", uid, () => db.query(sql, args));
        if (rpc[1] === "place_order") fireOrderWebhook(r.rows[0].r.id);
        return send(res, 200, r.rows[0].r);
      } catch (e) { return send(res, 400, { code: "P0001", message: e.message }); }
    }
    send(res, 404, { message: "not mocked" });
  } catch (e) { console.log("  ERR", e.message); send(res, 500, { message: e.message }); }
}).listen(port, () => console.log(`mock supabase (auth${CONFIRM ? ", confirm emails" : ""}) on http://localhost:${port}`));
