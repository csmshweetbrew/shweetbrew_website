// ===========================================================================
// order-emails · Supabase Edge Function
//
// Runs for every new order (a Database Webhook on `orders`, INSERT and UPDATE)
// and sends two emails through Resend:
//   1. to the owner: "New order SB-1001": customer, phone, area, items, total
//      (website orders only; orders an admin logs by hand don't need it);
//   2. to the customer: "we've got your order, awaiting confirmation", in the order's language
//      (English or Hebrew), when the order has an email. With Bit or PayBox
//      it says where to send the money.
// When a customer presses "I've paid" or picks another way to pay (an UPDATE),
// the owner gets another one. When an order is marked paid, the customer gets
// "We've got your payment".
// Every other update is ignored.
//
// One file with no imports, so it can be pasted into the Supabase dashboard
// (Edge Functions → Deploy a new function → Via editor). Setup: README.md →
// "Order emails". Test locally: tools/supabase-standin/order-emails-local.mjs.
//
// Secrets (Edge Functions → Secrets):
//   ORDER_WEBHOOK_SECRET  any long random text; the webhook sends it in the
//                         `x-webhook-secret` header, so nobody else can trigger this
//   RESEND_API_KEY        Resend API key (the same one as the SMTP setup)
//   OWNER_EMAIL           where new-order alerts go (comma-separate for several)
//   ORDER_EMAIL_FROM      optional, default "Shweet Brew <orders@shweetbrew.com>"
//                         (must be on a domain verified in Resend)
//   SITE_URL              optional, default https://shweetbrew.com
// Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY itself
// (SERVICE_KEY overrides the latter if the legacy keys are switched off).
// ===========================================================================

export type Env = Record<string, string | undefined>;

type Order = {
  id: string;
  reference: string;
  source: string;
  customer_name: string;
  phone: string | null; // optional since migration 0017
  email: string | null;
  zone_id: string | null;
  zone_name: string | null;
  city: string | null;
  street: string | null;
  apartment: string | null;
  notes: string | null;
  language: "en" | "he";
  subtotal: number | string;
  delivery_fee: number | string | null;
  total: number | string;
  requested_delivery_date: string | null;
  created_at: string;
  payment_method?: string | null; // since migration 0018
  payment_claimed_at?: string | null;
  payment_changes?: number;
  payment_status?: string;
  status?: string;
};

type Item = {
  product_name: string;
  category_name: string | null;
  size_label: string;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
};

const WHATSAPP_DISPLAY = "058-413-2576";
const PAY_NUMBER_DISPLAY = "058-413-2576"; // Bit and PayBox (same as client/src/lib/payMethods.ts)

// Shown under the customer's order details. Not a tax invoice or a receipt.
const BUSINESS = { name: "Shweet Brew", owner: { en: "Uri Marks", he: "אורי מרקס" }, osek: "346919780", city: { en: "Modiin, Israel", he: "מודיעין" }, email: "urimarks@gmail.com" };

function methodText(m: string | null | undefined, he: boolean) {
  switch (m) {
    case "bit_paybox": return he ? "Bit או PayBox" : "Bit or PayBox";
    case "bit": return "Bit";
    case "paybox": return "PayBox";
    case "bank_transfer": return he ? "העברה בנקאית" : "Bank transfer";
    case "cash": return he ? "מזומן" : "Cash";
    default: return "";
  }
}

const ZONE_HE: Record<string, string> = {
  modiin: "מודיעין (מטה)",
  zone_1_tel_aviv: "אזור תל אביב",
  zone_2_hasharon: "אזור השרון",
  zone_3_shfela: "שפלה",
  zone_4_jerusalem: "אזור ירושלים",
  zone_5_north: "צפון",
  zone_6_south: "דרום",
  zone_7_kiryat_gat: "קריית גת",
  zone_everywhere_else: "מקום אחר",
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const shekel = (n: number | string | null) => {
  const v = Number(n ?? 0);
  return "₪" + (Number.isInteger(v) ? String(v) : v.toFixed(2));
};

function feeText(order: Order, he: boolean) {
  if (order.delivery_fee === null) return he ? "בתיאום" : "To arrange";
  if (Number(order.delivery_fee) === 0) return he ? "חינם" : "Free";
  return shekel(order.delivery_fee);
}

function dateText(iso: string | null, he: boolean) {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" }); // yyyy-mm-dd
  if (iso.slice(0, 10) === today) return he ? "היום" : "Today";
  return d.toLocaleDateString(he ? "he-IL" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jerusalem" });
}

const zoneText = (order: Order, he: boolean) =>
  (he && order.zone_id && ZONE_HE[order.zone_id]) || order.zone_name || (he ? "לא נבחר אזור" : "No area chosen");

/** Every second Monday: the date isn't certain yet */
const TO_CONFIRM = ["zone_6_south", "zone_7_kiryat_gat"];
const toConfirm = (order: Order, he: boolean) =>
  TO_CONFIRM.includes(order.zone_id ?? "") ? (he ? " (התאריך יאושר בהמשך)" : " (date to be confirmed)") : "";

const addressText = (order: Order) => [order.street, order.apartment, order.city].filter(Boolean).join(", ");

/** Israeli phone → wa.me number (972…), or null if it doesn't look like one */
function waNumber(phone: string | null) {
  let d = (phone ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "972" + d.slice(1);
  return d.length >= 11 && d.length <= 13 ? d : null;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Email layout (matches supabase/email-templates: cream page, white card, red band)
// ---------------------------------------------------------------------------
function frame(inner: string, he: boolean) {
  return `<div dir="${he ? "rtl" : "ltr"}" style="margin:0;padding:24px 12px;background:#f5efe6;font-family:Arial,Helvetica,sans-serif;color:#1a1816">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e8dfd2">
    <div style="background:#cd2027;padding:18px 24px;text-align:center">
      <span style="font-size:24px;letter-spacing:3px;font-weight:900;color:#f5e9d9">SHWEET BREW</span>
    </div>
    <div style="padding:28px 24px;text-align:${he ? "right" : "left"}">${inner}</div>
  </div>
</div>`;
}

function itemsTable(items: Item[], order: Order, he: boolean) {
  const align = he ? "left" : "right";
  const rows = items.map((it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee5d8;font-size:15px">
          <b>${esc(it.product_name)}</b>${it.category_name ? ` <span style="color:#867f77">· ${esc(it.category_name)}</span>` : ""}<br>
          <span style="color:#5a534c;font-size:14px">${esc(it.size_label)} × ${esc(it.quantity)}${it.quantity > 1 ? ` · ${he ? `${shekel(it.unit_price)} ליחידה` : `${shekel(it.unit_price)} each`}` : ""}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee5d8;font-size:15px;text-align:${align};white-space:nowrap;vertical-align:top">${shekel(it.line_total)}</td>
      </tr>`).join("");
  const line = (label: string, value: string, strong = false) => `
      <tr>
        <td style="padding:${strong ? "10px 0 0" : "6px 0 0"};font-size:${strong ? "18px" : "15px"};${strong ? "font-weight:900" : "color:#5a534c"}">${label}</td>
        <td style="padding:${strong ? "10px 0 0" : "6px 0 0"};font-size:${strong ? "18px" : "15px"};text-align:${align};${strong ? "font-weight:900;color:#cd2027" : "color:#5a534c"}">${value}</td>
      </tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 8px">
      ${rows}
      ${line(he ? "סכום ביניים" : "Subtotal", shekel(order.subtotal))}
      ${line(he ? "משלוח" : "Delivery", feeText(order, he))}
      ${line(he ? "סה״כ" : "Total", shekel(order.total), true)}
    </table>`;
}

/** Who sold it, to whom and when: with the items table this is the whole order on paper */
function detailsBlock(order: Order, he: boolean) {
  const T = (en: string, hebrew: string) => (he ? hebrew : en);
  const row = (label: string, value: string) => `<tr><td style="padding:3px 0;color:#867f77;white-space:nowrap;vertical-align:top;padding-${he ? "left" : "right"}:14px">${label}</td><td style="padding:3px 0;width:100%">${value}</td></tr>`;
  const ltr = (t: string) => `<span dir="ltr">${esc(t)}</span>`;
  const when = new Date(order.created_at).toLocaleDateString(he ? "he-IL" : "en-GB", { timeZone: "Asia/Jerusalem", day: "numeric", month: "long", year: "numeric" });
  const address = addressText(order);
  const how = methodText(order.payment_method, he);
  return `${h(T("Details", "פרטים"))}<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;line-height:1.5">
      ${row(T("Order", "הזמנה"), `${ltr(order.reference)} · ${esc(when)}`)}
      ${row(T("For", "עבור"), [esc(order.customer_name), address ? esc(address) : "", order.phone ? ltr(order.phone) : "", order.email ? ltr(order.email) : ""].filter(Boolean).join("<br>"))}
      ${how ? row(T("Payment", "תשלום"), esc(how)) : ""}
      ${row(T("From", "מאת"), [`${BUSINESS.name}, ${T(BUSINESS.owner.en, BUSINESS.owner.he)}`, `${T("Osek Patur", "עוסק פטור")} ${ltr(BUSINESS.osek)}`, T(BUSINESS.city.en, BUSINESS.city.he), `${ltr(WHATSAPP_DISPLAY)} · ${ltr(BUSINESS.email)}`].join("<br>"))}
    </table>`;
}

const h = (text: string) => `<p style="margin:24px 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#cd2027">${text}</p>`;
const p = (html: string, extra = "") => `<p style="margin:0 0 6px;font-size:15px;line-height:1.5;${extra}">${html}</p>`;

// ---------------------------------------------------------------------------
// The emails
// ---------------------------------------------------------------------------
export function ownerEmail(order: Order, items: Item[], siteUrl: string) {
  const wa = waNumber(order.phone);
  const address = addressText(order);
  const date = dateText(order.requested_delivery_date, false);
  const inner = `
    <p style="margin:0 0 4px;font-size:14px;color:#867f77">New order${order.language === "he" ? " · customer reads Hebrew" : ""}</p>
    <p style="margin:0 0 4px;font-size:30px;font-weight:900">${esc(order.reference)} · ${shekel(order.total)}</p>
    <p style="margin:0 0 4px;font-size:15px;color:#5a534c">${esc(zoneText(order, false))}${date ? ` · wants ${esc(date)}${toConfirm(order, false)}` : ""}</p>
    ${h("Customer")}
    ${p(`<b>${esc(order.customer_name)}</b>`)}
    ${order.phone ? p(`<a href="tel:${esc(order.phone.replace(/[^\d+]/g, ""))}" style="color:#1a1816">${esc(order.phone)}</a>${wa ? ` · <a href="https://wa.me/${wa}" style="color:#1a7f45;font-weight:700">WhatsApp</a>` : ""}`) : p(`<span style="color:#867f77">No phone given: reply to this email to reach them</span>`)}
    ${order.email ? p(`<a href="mailto:${esc(order.email)}" style="color:#1a1816">${esc(order.email)}</a>`) : ""}
    ${h("Delivery")}
    ${p(esc(zoneText(order, false)))}
    ${p(address ? esc(address) : `<span style="color:#867f77">No address (pickup?)</span>`)}
    ${order.notes ? p(`<span style="color:#5a534c">Note:</span> ${esc(order.notes)}`, "background:#f5efe6;padding:10px 12px;border-radius:6px") : ""}
    ${order.payment_method ? h("Payment") + p(`<b>${esc(methodText(order.payment_method, false))}</b>${order.payment_method === "bank_transfer" ? " · send them the bank details" : ""}`) : ""}
    ${h("Items")}
    ${itemsTable(items, order, false)}
    <p style="margin:24px 0 0;font-size:13px;color:#867f77">Status: new, unpaid. Placed ${esc(new Date(order.created_at).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", dateStyle: "medium", timeStyle: "short" }))} on ${esc(siteUrl.replace(/^https?:\/\//, ""))}.</p>`;
  return {
    subject: `New order ${order.reference} · ${shekel(order.total)} · ${zoneText(order, false)}`,
    html: frame(inner, false),
  };
}

export function customerEmail(order: Order, items: Item[], siteUrl: string) {
  const he = order.language === "he";
  const first = order.customer_name.trim().split(/\s+/)[0] || "";
  const address = addressText(order);
  const pickup = order.zone_id === "modiin" && !address;
  const date = order.zone_id === "zone_everywhere_else" ? "" : dateText(order.requested_delivery_date, he);
  const T = (en: string, hebrew: string) => (he ? hebrew : en);
  // What happens next, by how they'll pay. The total isn't final while delivery is to be arranged.
  const m = order.payment_method;
  const payApp = m === "bit_paybox" && order.delivery_fee !== null ? methodText(m, he) : "";
  const reach = (en: string, hebrew: string) => order.phone
    ? T(`We'll call or message you to confirm ${en}`, `ניצור איתכם קשר בטלפון או בהודעה כדי לאשר ${hebrew}`)
    : T(`We'll email you to confirm ${en}`, `נשלח לכם מייל כדי לאשר ${hebrew}`);
  const next = !m
    ? reach("it and arrange payment (Bit, PayBox, bank transfer, or cash in Modiin).", "אותה ולתאם תשלום (Bit, PayBox, העברה בנקאית, או מזומן במודיעין).")
    : order.delivery_fee === null
      ? reach("the delivery price and the final total.", "את מחיר המשלוח והסכום הסופי.")
      : m === "bank_transfer"
        ? reach("the delivery time and send the bank details.", "את זמן המשלוח ונשלח את פרטי הבנק.")
        : m === "cash"
          ? reach("the delivery time. You pay in cash when you get it.", "את זמן המשלוח. משלמים במזומן בקבלה.")
          : reach("the delivery time.", "את זמן המשלוח.");
  const inner = `
    <p style="margin:0 0 4px;font-size:20px;font-weight:900">${esc(T(`Thanks${first ? `, ${first}` : ""}! We've got your order.`, `תודה${first ? `, ${first}` : ""}! קיבלנו את ההזמנה.`))}</p>
    <p style="margin:0 0 4px;font-size:15px;font-weight:700">${T("It's awaiting confirmation.", "היא ממתינה לאישור.")}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#5a534c">${esc(next)}</p>
    <div style="background:#f5efe6;border-radius:6px;padding:14px 16px;margin:0 0 4px">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#867f77">${T("Order number", "מספר הזמנה")}</p>
      <p style="margin:2px 0 0;font-size:28px;font-weight:900;letter-spacing:1px;color:#cd2027" dir="ltr">${esc(order.reference)}</p>
    </div>
    ${payApp ? h(T("Payment", "תשלום")) + p(T(
      `Send <b>${shekel(order.total)}</b> with <b>${payApp}</b> to <b dir="ltr">${PAY_NUMBER_DISPLAY}</b> and write <b dir="ltr">${esc(order.reference)}</b> in the note.`,
      `שלחו <b>${shekel(order.total)}</b> ב-<b>${payApp}</b> למספר <b dir="ltr">${PAY_NUMBER_DISPLAY}</b> וכתבו <b dir="ltr">${esc(order.reference)}</b> בהערה.`)) : ""}
    ${h(T("Delivery", "משלוח"))}
    ${p(`<b>${esc(zoneText(order, he))}</b>`)}
    ${date ? p(`${T("Next available delivery", "המשלוח הקרוב")}: <b>${esc(date)}</b>${toConfirm(order, he)}`) : p(esc(T("We'll arrange the day with you.", "נתאם איתכם את היום.")))}
    ${pickup ? p(esc(T("Pickup in Modiin: we'll send you the details.", "איסוף עצמי במודיעין: נשלח לכם את הפרטים."))) : address ? p(esc(address)) : ""}
    ${order.notes ? p(`<span style="color:#5a534c">${T("Your note", "ההערה שלכם")}:</span> ${esc(order.notes)}`) : ""}
    ${h(T("Your order", "ההזמנה שלכם"))}
    ${itemsTable(items, order, he)}
    ${detailsBlock(order, he)}
    ${p(T("These are your order details, not a receipt.", "אלה פרטי ההזמנה, לא קבלה."), "color:#867f77;font-size:13px;margin-top:10px")}
    <hr style="border:none;border-top:1px solid #eee5d8;margin:24px 0 16px">
    <p style="margin:0;font-size:14px;color:#5a534c">${T(
      `Questions? Just reply to this email, or WhatsApp us on <b dir="ltr">${WHATSAPP_DISPLAY}</b>.`,
      `שאלות? פשוט השיבו למייל הזה, או כתבו לנו ב-WhatsApp ל-<b dir="ltr">${WHATSAPP_DISPLAY}</b>.`)}</p>`;
  return {
    subject: T(`We've got your order ${order.reference}: awaiting confirmation`, `קיבלנו את ההזמנה ${order.reference}: ממתינה לאישור`),
    html: frame(inner, he),
  };
}

/** An order was marked paid: the customer gets a thank-you with everything in it */
export function paidEmail(order: Order, items: Item[]) {
  const he = order.language === "he";
  const T = (en: string, hebrew: string) => (he ? hebrew : en);
  const inner = `
    <p style="margin:0 0 4px;font-size:20px;font-weight:900">${T("We've got your payment. Thank you!", "קיבלנו את התשלום. תודה!")}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#5a534c">${T("Your receipt comes separately.", "הקבלה תישלח בנפרד.")}</p>
    <div style="background:#f5efe6;border-radius:6px;padding:14px 16px;margin:0 0 4px">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#867f77">${T("Paid", "שולם")}</p>
      <p style="margin:2px 0 0;font-size:28px;font-weight:900;color:#cd2027"><span dir="ltr">${shekel(order.total)}</span> · <span dir="ltr">${esc(order.reference)}</span></p>
    </div>
    ${h(T("Your order", "ההזמנה שלכם"))}
    ${itemsTable(items, order, he)}
    ${detailsBlock(order, he)}
    <hr style="border:none;border-top:1px solid #eee5d8;margin:24px 0 16px">
    <p style="margin:0;font-size:14px;color:#5a534c">${T(
      `Questions? Just reply to this email, or WhatsApp us on <b dir="ltr">${WHATSAPP_DISPLAY}</b>.`,
      `שאלות? פשוט השיבו למייל הזה, או כתבו לנו ב-WhatsApp ל-<b dir="ltr">${WHATSAPP_DISPLAY}</b>.`)}</p>`;
  return { subject: T(`We've got your payment for ${order.reference}`, `קיבלנו את התשלום על ${order.reference}`), html: frame(inner, he) };
}

/** The customer pressed "I've paid": the owner checks the app */
export function claimedEmail(order: Order) {
  const app = methodText(order.payment_method, false);
  const inner = `
    <p style="margin:0 0 4px;font-size:14px;color:#867f77">The customer says they've paid</p>
    <p style="margin:0 0 12px;font-size:30px;font-weight:900">${esc(order.reference)} · ${shekel(order.total)}</p>
    ${p(`Check <b>${esc(app)}</b> for <b>${shekel(order.total)}</b> from <b>${esc(order.customer_name)}</b>${order.phone ? ` (${esc(order.phone)})` : ""}. The note should say ${esc(order.reference)}.`)}
    ${p(`<span style="color:#867f77">The order is still marked unpaid until you change it.</span>`)}`;
  return { subject: `${order.reference}: customer says paid · ${shekel(order.total)} · ${app}`, html: frame(inner, false) };
}

/** The customer picked another way to pay after ordering */
export function changedEmail(order: Order) {
  const how = methodText(order.payment_method, false);
  const inner = `
    <p style="margin:0 0 4px;font-size:14px;color:#867f77">The customer changed how they'll pay</p>
    <p style="margin:0 0 12px;font-size:30px;font-weight:900">${esc(order.reference)} · ${shekel(order.total)}</p>
    ${p(`Now: <b>${esc(how)}</b>${order.payment_method === "bank_transfer" ? " · send them the bank details" : ""}`)}
    ${p(`${esc(order.customer_name)}${order.phone ? ` · ${esc(order.phone)}` : ""}${order.email ? ` · ${esc(order.email)}` : ""}`)}`;
  return { subject: `${order.reference}: now paying by ${how}`, html: frame(inner, false) };
}

// ---------------------------------------------------------------------------
// Request handler (exported so the local test can call it without Deno)
// ---------------------------------------------------------------------------
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function loadItems(env: Env, orderId: string, f: typeof fetch): Promise<Item[]> {
  const base = env.SUPABASE_URL!.replace(/\/$/, "");
  // Supabase injects SUPABASE_SERVICE_ROLE_KEY. If the legacy keys are ever switched
  // off, add a secret SERVICE_KEY = your sb_secret_… key (names can't start with SUPABASE_).
  const key = env.SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
  const headers: Record<string, string> = { apikey: key, Accept: "application/json" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`; // legacy JWT keys
  const url = `${base}/rest/v1/order_items?order_id=eq.${encodeURIComponent(orderId)}` +
    `&select=product_name,category_name,size_label,unit_price,quantity,line_total&order=id.asc`;
  // The webhook fires after the order is saved, items included; retry once just in case.
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await f(url, { headers });
    if (!r.ok) throw new Error(`order_items: ${r.status} ${await r.text()}`);
    const rows = (await r.json()) as Item[];
    if (rows.length) return rows;
    await new Promise((res) => setTimeout(res, 1500));
  }
  return [];
}

async function sendEmail(env: Env, f: typeof fetch, msg: { to: string[]; subject: string; html: string; reply_to?: string[] }) {
  const r = await f(env.RESEND_API_URL || "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.ORDER_EMAIL_FROM || "Shweet Brew <orders@shweetbrew.com>", ...msg }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  return ((await r.json()) as { id?: string }).id ?? "sent";
}

export async function handleRequest(req: Request, env: Env, f: typeof fetch = fetch): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const secret = env.ORDER_WEBHOOK_SECRET || "";
  if (!secret || !timingSafeEqual(req.headers.get("x-webhook-secret") || "", secret)) {
    return json(401, { error: "bad or missing x-webhook-secret" });
  }
  for (const k of ["RESEND_API_KEY", "SUPABASE_URL"]) if (!env[k]) return json(500, { error: `missing secret ${k}` });

  let payload: { type?: string; table?: string; record?: Order; old_record?: Order | null };
  try { payload = await req.json(); } catch { return json(400, { error: "body is not JSON" }); }
  const order = payload.record;
  const old = payload.type === "UPDATE" ? payload.old_record : null;
  const justClaimed = !!old && !!order?.payment_claimed_at && !old.payment_claimed_at;
  const justChanged = !!old && Number(order?.payment_changes ?? 0) > Number(old.payment_changes ?? 0);
  const justPaid = !!old && order?.payment_status === "paid" && old.payment_status !== "paid" && order.status !== "cancelled";
  if (payload.table !== "orders" || !order?.id || (payload.type !== "INSERT" && !justClaimed && !justChanged && !justPaid)) {
    return json(200, { skipped: "not a new order" });
  }

  const siteUrl = (env.SITE_URL || "https://shweetbrew.com").replace(/\/$/, "");
  const owners = (env.OWNER_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (justPaid) {
    if (!order.email) return json(200, { skipped: "no email" });
    try {
      const m = paidEmail(order, await loadItems(env, order.id, f));
      const sent = await sendEmail(env, f, { to: [order.email], subject: m.subject, html: m.html, reply_to: owners.length ? [owners[0]] : undefined });
      return json(200, { reference: order.reference, paid: sent });
    } catch (e) {
      console.error(order.reference, "paid", String(e));
      return json(502, { error: String(e) });
    }
  }

  if (justClaimed || justChanged) {
    if (!owners.length) return json(200, { skipped: "no OWNER_EMAIL" });
    try {
      const m = justClaimed ? claimedEmail(order) : changedEmail(order);
      const sent = await sendEmail(env, f, { to: owners, subject: m.subject, html: m.html, reply_to: order.email ? [order.email] : undefined });
      return json(200, { reference: order.reference, [justClaimed ? "claimed" : "changed"]: sent });
    } catch (e) {
      console.error(order.reference, justClaimed ? "claimed" : "changed", String(e));
      return json(502, { error: String(e) });
    }
  }

  let items: Item[];
  try { items = await loadItems(env, order.id, f); } catch (e) {
    console.error(order.reference, String(e));
    return json(502, { error: String(e) });
  }

  const jobs: Record<string, Promise<string>> = {};
  if (order.source === "website" && owners.length) {
    const m = ownerEmail(order, items, siteUrl);
    jobs.owner = sendEmail(env, f, { to: owners, subject: m.subject, html: m.html, reply_to: order.email ? [order.email] : undefined });
  }
  if (order.email) {
    const m = customerEmail(order, items, siteUrl);
    jobs.customer = sendEmail(env, f, { to: [order.email], subject: m.subject, html: m.html, reply_to: owners.length ? [owners[0]] : undefined });
  }

  const names = Object.keys(jobs);
  const settled = await Promise.allSettled(Object.values(jobs));
  const result: Record<string, string> = {};
  let failed = false;
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") result[names[i]] = s.value;
    else { failed = true; result[names[i]] = `error: ${String(s.reason)}`; console.error(order.reference, names[i], String(s.reason)); }
  });
  console.log(order.reference, JSON.stringify(result));
  return json(failed ? 502 : 200, { reference: order.reference, ...result });
}

// Deno (Supabase) entry point; skipped when imported by the Node test.
type DenoLike = { serve: (h: (r: Request) => Response | Promise<Response>) => void; env: { toObject(): Env } };
const deno = (globalThis as { Deno?: DenoLike }).Deno;
if (deno) deno.serve((req) => handleRequest(req, deno.env.toObject()));
