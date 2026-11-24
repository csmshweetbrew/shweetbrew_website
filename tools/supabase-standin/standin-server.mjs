// Local stand-in for Supabase (the REST calls the site makes),
// backed by PGlite with the real migrations + seed. Local testing only.
//   node standin-server.mjs <repo> <port>
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import http from "node:http";

const [root, portArg] = process.argv.slice(2);
const port = Number(portArg || 54399);
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

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS", "Content-Type": "application/json" };
const send = (res, status, body) => { res.writeHead(status, cors); res.end(JSON.stringify(body)); };
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

// Like Supabase's Database Webhook on orders (INSERT and UPDATE): after an order is saved,
// POST it to the order-emails function if ORDER_WEBHOOK_URL is set
// (see order-emails-local.mjs). Fire-and-forget, like pg_net.
async function fireOrderWebhook(orderId, old = null) {
  const target = process.env.ORDER_WEBHOOK_URL;
  if (!target || !orderId) return;
  try {
    const record = (await db.query(`select * from public.orders where id = $1`, [orderId])).rows[0];
    const r = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": process.env.ORDER_WEBHOOK_SECRET || "" },
      body: JSON.stringify({ type: old ? "UPDATE" : "INSERT", table: "orders", schema: "public", record, old_record: old }),
    });
    console.log("  order webhook →", r.status, await r.text());
  } catch (e) { console.log("  order webhook failed:", e.message); }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  let body = ""; for await (const c of req) body += c;
  const json = body ? JSON.parse(body) : {};
  console.log(req.method, url.pathname + url.search);
  try {
    // ---- REST ----
    if (url.pathname === "/rest/v1/categories") {
      const r = await db.query(`select coalesce(json_agg(c), '[]'::json) data from (select cat.id, cat.name_en, cat.name_he, cat.description_en, cat.image, cat.sort_order,
        (select coalesce(json_agg(p), '[]'::json) from (select pr.*, (select coalesce(json_agg(s), '[]'::json) from public.product_sizes s where s.product_id = pr.id) product_sizes
         from public.products pr where pr.category_id = cat.id) p) products from public.categories cat where cat.is_active) c`);
      return send(res, 200, r.rows[0].data);
    }
    // Read by the order-emails function with the service key (no RLS)
    if (url.pathname === "/rest/v1/order_items" && req.method === "GET") {
      const id = (url.searchParams.get("order_id") || "").replace(/^eq\./, "");
      const r = await db.query(`select product_name, category_name, size_label, unit_price, quantity, line_total from public.order_items where order_id = $1 order by id`, [id]);
      return send(res, 200, r.rows);
    }
    const payFn = url.pathname.match(/^\/rest\/v1\/rpc\/(claim_payment|set_payment_method)$/)?.[1];
    if (payFn) {
      const old = (await db.query(`select * from public.orders where id = $1`, [json.p_order_id])).rows[0];
      const r = await asRole("anon", null, () => payFn === "claim_payment"
        ? db.query(`select public.claim_payment($1) r`, [json.p_order_id])
        : db.query(`select public.set_payment_method($1, $2) r`, [json.p_order_id, json.p_method]));
      if (old) fireOrderWebhook(json.p_order_id, old);
      return send(res, 200, r.rows[0].r);
    }
    const rpc = url.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
    if (rpc) {
      try {
        const r = await asRole("anon", null, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(json.p_order)]));
        if (rpc[1] === "place_order") fireOrderWebhook(r.rows[0].r.id);
        return send(res, 200, r.rows[0].r);
      } catch (e) { return send(res, 400, { code: "P0001", message: e.message }); }
    }
    send(res, 404, { message: "not mocked" });
  } catch (e) { console.log("  ERR", e.message); send(res, 500, { message: e.message }); }
}).listen(port, () => console.log(`mock supabase on http://localhost:${port}`));
