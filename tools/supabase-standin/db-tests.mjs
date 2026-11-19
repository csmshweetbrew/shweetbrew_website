import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const root = process.argv[2];
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; console.log("  ok  ", msg); } else { fail++; console.log("  FAIL", msg); } };

// --- Minimal Supabase stand-in: roles, auth schema, default grants, publication
await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, phone text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select current_setting('request.jwt.claim.role', true) $$;
grant usage on schema auth to anon, authenticated;
grant execute on all functions in schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public revoke execute on functions from public;
create publication supabase_realtime;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid default auth.uid());
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant all on storage.objects, storage.buckets to anon, authenticated;
`);

const files = readdirSync(`${root}/supabase/migrations`).filter(f => f.endsWith(".sql")).sort();
for (const f of files) {
  try { await db.exec(readFileSync(`${root}/supabase/migrations/${f}`, "utf8")); console.log("  applied", f); }
  catch (e) { console.log("  FAILED", f, e.message); process.exit(1); }
}
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8"));
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8")); // twice: must be idempotent
const counts = (await db.query(`select (select count(*) from public.products) p, (select count(*) from public.product_sizes) s, (select count(*) from public.delivery_zones) z`)).rows[0];
ok(counts.p == 14 && counts.s == 47 && counts.z == 9, `seed applied twice, counts ${JSON.stringify(counts)}`);
const pub = (await db.query(`select tablename from pg_publication_tables where pubname='supabase_realtime' order by 1`)).rows.map(r => r.tablename);
ok(pub.join() === "order_items,orders,product_sizes,products", "realtime publication tables " + pub);

// Users
const admin = (await db.query(`insert into auth.users (email, raw_user_meta_data) values ('owner@example.test', '{"full_name":"Owner"}') returning id`)).rows[0].id;
const cust = (await db.query(`insert into auth.users (email, raw_user_meta_data) values ('dana@example.test', '{"full_name":"Dana","language":"he"}') returning id`)).rows[0].id;
const guest = (await db.query(`insert into auth.users (email) values ('guest@example.test') returning id`)).rows[0].id;
const unconfirmed = (await db.query(`insert into auth.users (email, email_confirmed_at) values ('typo@example.test', null) returning id`)).rows[0].id;
const prof = (await db.query(`select * from public.profiles where id=$1`, [cust])).rows[0];
ok(prof && prof.full_name === "Dana" && prof.preferred_language === "he" && prof.role === "customer", "signup trigger created profile");
await db.query(`update public.profiles set role='admin' where id=$1`, [admin]);

// Helper to run as a role, in a transaction, then roll back or commit
async function as(role, uid, fn, { commit = true } = {}) {
  await db.exec("begin");
  try {
    await db.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)`, [uid ?? "", role]);
    await db.exec(`set local role ${role}`);
    const r = await fn();
    await db.exec(commit ? "commit" : "rollback");
    return r;
  } catch (e) { await db.exec("rollback"); throw e; }
}
async function expectError(role, uid, sql, params, match, msg) {
  try { await as(role, uid, () => db.query(sql, params)); ok(false, msg + " (no error)"); }
  catch (e) { ok(String(e.message).includes(match), `${msg} -> ${e.message}`); }
}

const sizeId = async (p, l) => (await db.query(`select id from public.product_sizes where product_id=$1 and label=$2`, [p, l])).rows[0].id;
const stockOf = async (p, l) => (await db.query(`select stock from public.product_sizes where product_id=$1 and label=$2`, [p, l])).rows[0].stock;

// Public catalogue
const anonProducts = await as("anon", null, () => db.query(`select count(*)::int c from public.product_sizes`));
ok(anonProducts.rows[0].c === 47, "anon reads catalogue");
await expectError("anon", null, `update public.product_sizes set price = 1`, [], "permission denied", "anon cannot change prices");
const priceAfter = (await db.query(`select min(price)::int m from public.product_sizes`)).rows[0].m;
ok(priceAfter > 1, "customer price update changed nothing (RLS) min price " + priceAfter);
await expectError("anon", null, `select * from public.orders`, [], "permission denied", "anon cannot read orders");
await expectError("anon", null, `insert into public.orders (customer_name, phone, subtotal, total) values ('x','0541234567',0,0)`, [], "permission denied", "anon cannot insert orders directly");
await expectError("authenticated", cust, `insert into public.orders (customer_name, phone, subtotal, total) values ('x','0541234567',0,0)`, [], "permission denied", "customer cannot insert orders directly");
await expectError("authenticated", cust, `update public.profiles set role='admin' where id = auth.uid()`, [], "permission denied", "customer cannot make themselves admin");
await as("authenticated", cust, () => db.query(`update public.profiles set full_name='Dana K' where id = auth.uid()`));
ok((await db.query(`select full_name from public.profiles where id=$1`, [cust])).rows[0].full_name === "Dana K", "customer edits own name");
const seeOthers = await as("authenticated", cust, () => db.query(`select count(*)::int c from public.profiles`));
ok(seeOthers.rows[0].c === 1, "customer sees only own profile");
await expectError("authenticated", cust, `select public.admin_set_stock($1, 5)`, [await sizeId("biltong-traditional", "250g")], "NOT_ADMIN", "customer cannot set stock");
await expectError("anon", null, `select public.admin_set_stock($1, 5)`, [await sizeId("biltong-traditional", "250g")], "permission denied", "anon cannot call admin functions");

// Admin sets stock
const s250 = await sizeId("biltong-traditional", "250g");
await as("authenticated", admin, () => db.query(`select public.admin_set_stock($1, 3, 'First count')`, [s250]));
await as("authenticated", admin, () => db.query(`select public.admin_adjust_stock($1, 2, 'restock', 'Wednesday batch')`, [s250]));
ok(await stockOf("biltong-traditional", "250g") === 5, "admin set 3 then restocked +2 = 5");

// Place orders
const order = (items, extra = {}) => ({ name: "Dana", phone: "054-123-4567", zone_id: "zone_1_tel_aviv", city: "Tel Aviv", street: "Dizengoff 1", language: "he", requested_delivery_date: "2099-01-05", items, ...extra });
const placed = await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(order([
  { product_id: "biltong-traditional", size: "250g", quantity: 2, price: 1 },
  { product_id: "biltong-traditional", size: "100g", quantity: 1 },
]))]));
const r = placed.rows[0].r;
ok(r.reference.startsWith("SB-") && Number(r.subtotal) === 250 && Number(r.delivery_fee) === 65 && Number(r.total) === 315, `guest order priced by DB, ignores browser price: ${JSON.stringify(r)}`);
ok(await stockOf("biltong-traditional", "250g") === 3, "stock 5 - 2 = 3");

// 0014: every order has a confirmed email
await expectError("anon", null, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }]))], "permission denied", "a visitor who hasn't confirmed an email can't order");
await expectError("authenticated", unconfirmed, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }]))], "EMAIL_NOT_CONFIRMED", "an unconfirmed email can't order");
await expectError("authenticated", guest, `select public.place_order_core($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }]))], "permission denied", "nobody can skip the gate by calling the inner function");
const guestOrder = (await db.query(`select email, user_id from public.orders where reference=$1`, [r.reference])).rows[0];
ok(guestOrder.email === "guest@example.test" && guestOrder.user_id === guest, "the order carries the confirmed email and the guest's account: " + JSON.stringify(guestOrder));
const typed = await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { email: "someone-else@example.test", phone: "0501112222" }))]));
ok((await db.query(`select email from public.orders where reference=$1`, [typed.rows[0].r.reference])).rows[0].email === "guest@example.test", "a typed email can't replace the confirmed one");
const gp = (await db.query(`select full_name, phone, city, street, default_zone_id from public.profiles where id=$1`, [guest])).rows[0];
ok(gp.full_name === "Dana" && gp.phone === "054-123-4567" && gp.city === "Tel Aviv" && gp.default_zone_id === "zone_1_tel_aviv", "the guest's details are remembered for next time: " + JSON.stringify(gp));
await db.query(`update public.profiles set full_name = 'Guest Kept' where id=$1`, [guest]);
await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { name: "Other Name", phone: "0503334444" }))]));
ok((await db.query(`select full_name from public.profiles where id=$1`, [guest])).rows[0].full_name === "Guest Kept", "saved details are never overwritten");
ok(await stockOf("biltong-traditional", "100g") === null, "untracked size stays untracked");

await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "250g", quantity: 4 }]))], "OUT_OF_STOCK:biltong-traditional:250g:3", "cannot order more than stock");
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "100g", quantity: 1 }]))], "BELOW_MINIMUM:80", "minimum order for delivery");
const pickup = await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "100g", quantity: 1 }], { zone_id: "modiin", phone: "0500000000" }))]));
ok(Number(pickup.rows[0].r.total) === 50, "Modiin pickup has no minimum and is free");
const arrange = await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { zone_id: "zone_everywhere_else", phone: "0500000001" }))]));
ok(arrange.rows[0].r.delivery_fee === null && Number(arrange.rows[0].r.total) === 195, "everywhere else: fee to arrange");
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "nope", size: "100g", quantity: 1 }]))], "UNAVAILABLE:nope:100g", "unknown product");
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "100g", quantity: 3 }], { phone: "hello" }))], "INVALID_INPUT:phone", "bad phone");
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([]))], "INVALID_INPUT:items", "empty cart");
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "100g", quantity: 3 }], { source: "admin", zone_id: "nowhere" }))], "INVALID_INPUT:zone_id", "bad zone");
await db.query(`update public.products set is_available=false where id='biltong-wasabi'`);
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-wasabi", size: "500g", quantity: 1 }]))], "UNAVAILABLE:biltong-wasabi", "unavailable product");

// Signed-in customer sees own order, not guest ones
const mine = await as("authenticated", cust, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { phone: "0520000000" }))]));
const visible = await as("authenticated", cust, () => db.query(`select o.reference, (select count(*)::int from public.order_items i where i.order_id=o.id) items from public.orders o`));
ok(visible.rows.length === 1 && visible.rows[0].reference === mine.rows[0].r.reference && visible.rows[0].items === 1, "customer sees only own order + its items");
const custHist = await as("authenticated", cust, () => db.query(`select count(*)::int c from public.order_status_history`));
ok(custHist.rows[0].c === 1, "customer sees own order history only");

// Admin app flows
const all = await as("authenticated", admin, () => db.query(`select count(*)::int c from public.order_overview`));
ok(all.rows[0].c === 6, "admin sees all orders: " + all.rows[0].c);
await as("authenticated", admin, () => db.query(`update public.orders set status='confirmed' where reference=$1`, [r.reference]));
await as("authenticated", admin, () => db.query(`update public.orders set status='cancelled' where reference=$1`, [r.reference]));
ok(await stockOf("biltong-traditional", "250g") === 5, "cancel gives stock back (3 + 2 = 5)");
const o1 = (await db.query(`select confirmed_at, cancelled_at from public.orders where reference=$1`, [r.reference])).rows[0];
ok(o1.confirmed_at && o1.cancelled_at, "status timestamps set");
await as("authenticated", admin, () => db.query(`update public.orders set status='preparing' where reference=$1`, [r.reference]));
ok(await stockOf("biltong-traditional", "250g") === 3, "reopening takes stock again");
await as("authenticated", admin, () => db.query(`select public.admin_set_stock($1, 1)`, [s250]));
await as("authenticated", admin, () => db.query(`update public.orders set status='cancelled' where reference=$1`, [r.reference]));
await as("authenticated", admin, () => db.query(`select public.admin_set_stock($1, 0)`, [s250]));
await expectError("authenticated", admin, `update public.orders set status='new' where reference=$1`, [r.reference], "product_sizes_stock_check", "cannot reopen when the stock is gone");
const hist = (await db.query(`select string_agg(coalesce(from_status::text,'-')||'>'||to_status, ' ' order by id) h from public.order_status_history where order_id=(select id from public.orders where reference=$1)`, [r.reference])).rows[0].h;
ok(hist === "->new new>confirmed confirmed>cancelled cancelled>preparing preparing>cancelled", "status history: " + hist);
const moves = (await db.query(`select reason, change, stock_after, note from public.stock_movements where size_id=$1 order by id`, [s250])).rows.map(m => `${m.reason}${m.change >= 0 ? "+" : ""}${m.change}=${m.stock_after}`);
ok(moves.join(" ") === "correction+3=3 restock+2=5 order-2=3 order_cancelled+2=5 order_restored-2=3 correction-2=1 order_cancelled+2=3 correction-3=0", "stock log: " + moves.join(" "));
const direct = await as("authenticated", admin, () => db.query(`update public.product_sizes set stock = 7 where id=$1`, [s250]));
const lastMove = (await db.query(`select reason from public.stock_movements where size_id=$1 order by id desc limit 1`, [s250])).rows[0].reason;
ok(lastMove === "adjustment", "a direct stock edit is logged as adjustment");
const stockView = await as("authenticated", admin, () => db.query(`select stock_state from public.stock_overview where size_id=$1`, [s250]));
ok(stockView.rows[0].stock_state === "ok", "stock_overview view works");
const custMoves = await as("authenticated", cust, () => db.query(`select count(*)::int c from public.stock_movements`));
ok(custMoves.rows[0].c === 0, "customer sees no stock log");

// Admin manual WhatsApp order with source + no minimum
const manual = await as("authenticated", admin, () => db.query(`select public.place_order($1::jsonb) r`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "100g", quantity: 1 }], { source: "whatsapp" }))]));
const src = (await db.query(`select source from public.orders where reference=$1`, [manual.rows[0].r.reference])).rows[0].source;
ok(src === "whatsapp", "admin can log a WhatsApp order below minimum");

// Flood guard
for (let i = 0; i < 4; i++) await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { phone: "0539999999" }))]));
await as("authenticated", guest, () => db.query(`select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { phone: "0539999999" }))]));
await expectError("authenticated", guest, `select public.place_order($1::jsonb)`, [JSON.stringify(order([{ product_id: "biltong-traditional", size: "500g", quantity: 1 }], { phone: "0539999999" }))], "TOO_MANY_ORDERS", "6th order in 10 minutes from one phone");

// Promote via RPC
const other = (await db.query(`insert into auth.users (email) values ('helper@example.test') returning id`)).rows[0].id;
await as("authenticated", admin, () => db.query(`select public.admin_set_role($1, 'admin')`, [other]));
ok((await db.query(`select role from public.profiles where id=$1`, [other])).rows[0].role === "admin", "admin promotes a helper");
await expectError("authenticated", admin, `select public.admin_set_role($1, 'customer')`, [admin], "cannot_remove_own_admin", "admin can't demote self");

// Product photo bucket
const bucket = (await db.query(`select public from storage.buckets where id='product-images'`)).rows[0];
ok(bucket?.public === true, "product-images bucket is public");
await as("authenticated", admin, () => db.query(`insert into storage.objects (bucket_id, name) values ('product-images', 'peri-peri-720.webp')`));
ok(true, "admin uploads a product photo");
await expectError("authenticated", cust, `insert into storage.objects (bucket_id, name) values ('product-images', 'x.webp')`, [], "row-level security", "customer cannot upload photos");
await expectError("anon", null, `insert into storage.objects (bucket_id, name) values ('product-images', 'x.webp')`, [], "row-level security", "guest cannot upload photos");
const seen = await as("anon", null, () => db.query(`select count(*)::int c from storage.objects where bucket_id='product-images'`));
ok(seen.rows[0].c === 1, "guests can see product photos");

// Email check (0013)
const has = async (email) => (await as("anon", null, () => db.query(`select public.email_has_account($1) r`, [email]))).rows[0].r;
ok(await has("Dana@Example.test") === true, "email check finds an account (any letter case)");
ok(await has("nobody@example.test") === false, "email check says no for an unknown address");
await expectError("anon", null, `select public.email_has_account('not-an-email')`, [], "INVALID_INPUT:email", "email check rejects a non-address");
for (let i = 0; i < 9; i++) await has("dana@example.test"); // 1 above + 9 = the 10 allowed
await expectError("anon", null, `select public.email_has_account('dana@example.test')`, [], "TOO_MANY_TRIES", "11th check of one address within an hour");
await expectError("anon", null, `select * from public.auth_email_checks`, [], "permission denied", "the check log is not readable");
const stored = (await db.query(`select count(*)::int c from public.auth_email_checks where email_hash like '%@%'`)).rows[0].c;
ok(stored === 0, "the log stores hashes, never addresses");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
