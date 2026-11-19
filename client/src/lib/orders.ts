/*
 * ORDER SUBMISSION
 *
 * With Supabase configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY), orders
 * go to the database through the `place_order` function
 * (supabase/migrations/0008_place_order.sql). It looks every price up itself, checks
 * stock, applies the delivery fee and minimum, takes the stock and returns the
 * real SB-#### reference. The admin app reads orders from there.
 *
 * WhatsApp copy: until the admin app is in use, each order ALSO opens WhatsApp
 * with the full order (the reference included), so nothing is missed. Set
 * VITE_ORDER_WHATSAPP_COPY=false in .env to stop that.
 *
 * Without Supabase the site behaves as before: the order opens in WhatsApp.
 */

import { getWhatsAppLink } from "@/config/site";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export const ORDER_BACKEND_READY = isSupabaseConfigured;
const WHATSAPP_COPY = import.meta.env.VITE_ORDER_WHATSAPP_COPY !== "false";

export type OrderLine = {
  productId?: string; // products.id in the database (variant id)
  product: string;
  category: string;
  size: string;
  quantity: number;
  price: number;
};

export type Order = {
  reference: string;
  name: string;
  phone: string;
  address: string; // one line, for messages
  city?: string;
  street?: string;
  apartment?: string;
  zoneId: string;
  zoneName: string;
  notes: string;
  language?: "en" | "he";
  requestedDeliveryDate?: string; // yyyy-mm-dd
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number | null; // null = to arrange
  total: number;
  createdAt: string;
};

export type OrderError =
  | { code: "OUT_OF_STOCK"; productId: string; size: string; left: number }
  | { code: "UNAVAILABLE"; productId: string; size: string }
  | { code: "BELOW_MINIMUM"; min: number }
  | { code: "INVALID_INPUT"; field: string }
  | { code: "TOO_MANY_ORDERS" }
  | { code: "NETWORK"; message: string };

export type SubmitResult = { ok: true; order: Order } | { ok: false; error: OrderError };

export function makeReference(): string {
  return `SB-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function orderToText(order: Order): string {
  return [
    `*Shweet Brew order ${order.reference}*`,
    "",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    order.address ? `Address: ${order.address}` : "Pickup / address to confirm",
    `Area: ${order.zoneName}`,
    "",
    ...order.lines.map((l) => `${l.category} – ${l.product} (${l.size}) x${l.quantity} – ₪${l.price * l.quantity}`),
    "",
    `Subtotal: ₪${order.subtotal}`,
    order.deliveryFee === null ? "Delivery: to arrange" : order.deliveryFee === 0 ? "Delivery: free" : `Delivery: ₪${order.deliveryFee}`,
    `*Total: ₪${order.total}*`,
    order.notes ? `\nNotes: ${order.notes}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** Turns the database's error message ("OUT_OF_STOCK:biltong-traditional:250g:3") into something typed. */
export function parseOrderError(message: string): OrderError {
  const m = message.match(/(OUT_OF_STOCK|UNAVAILABLE|BELOW_MINIMUM|INVALID_INPUT|TOO_MANY_ORDERS)(?::([^\s]*))?/);
  if (!m) return { code: "NETWORK", message };
  const parts = (m[2] ?? "").split(":");
  switch (m[1]) {
    case "OUT_OF_STOCK":
      return { code: "OUT_OF_STOCK", productId: parts[0], size: parts[1], left: Number(parts[2]) || 0 };
    case "UNAVAILABLE":
      return { code: "UNAVAILABLE", productId: parts[0], size: parts[1] };
    case "BELOW_MINIMUM":
      return { code: "BELOW_MINIMUM", min: Number(parts[0]) || 0 };
    case "INVALID_INPUT":
      return { code: "INVALID_INPUT", field: parts[0] || "" };
    default:
      return { code: "TOO_MANY_ORDERS" };
  }
}

type PlaceOrderResponse = { id: string; reference: string; subtotal: number; delivery_fee: number | null; total: number; created_at: string };

async function sendToBackend(order: Order): Promise<SubmitResult> {
  const sb = await getSupabase();
  if (!sb) return { ok: false, error: { code: "NETWORK", message: "Supabase is not configured" } };
  const missing = order.lines.find((l) => !l.productId);
  if (missing) return { ok: false, error: { code: "UNAVAILABLE", productId: "", size: missing.size } };

  const { data, error } = await sb.rpc("place_order", {
    p_order: {
      name: order.name,
      phone: order.phone,
      zone_id: order.zoneId,
      city: order.city ?? "",
      street: order.street ?? "",
      apartment: order.apartment ?? "",
      notes: order.notes,
      language: order.language ?? "en",
      requested_delivery_date: order.requestedDeliveryDate ?? null,
      // prices are deliberately not sent: the database decides them
      items: order.lines.map((l) => ({ product_id: l.productId, size: l.size, quantity: l.quantity })),
    },
  });
  if (error) return { ok: false, error: parseOrderError(error.message) };

  const r = data as PlaceOrderResponse;
  return {
    ok: true,
    order: {
      ...order,
      reference: r.reference,
      subtotal: Number(r.subtotal),
      deliveryFee: r.delivery_fee == null ? null : Number(r.delivery_fee),
      total: Number(r.total),
      createdAt: r.created_at,
    },
  };
}

/**
 * Call this directly from the click handler: any WhatsApp tab has to be opened
 * during the click (browsers block pop-ups opened later), so it is opened
 * empty first and pointed at WhatsApp once the database has answered.
 */
export async function submitOrder(order: Order): Promise<SubmitResult> {
  if (!ORDER_BACKEND_READY) {
    window.open(getWhatsAppLink(orderToText(order)), "_blank", "noopener");
    return { ok: true, order };
  }

  const tab = WHATSAPP_COPY ? window.open("", "_blank") : null;
  if (tab) tab.opener = null;

  let result: SubmitResult;
  try {
    result = await sendToBackend(order);
  } catch (err) {
    result = { ok: false, error: { code: "NETWORK", message: err instanceof Error ? err.message : String(err) } };
  }

  if (tab) {
    if (result.ok) tab.location.href = getWhatsAppLink(orderToText(result.order));
    else tab.close();
  }
  return result;
}

/** WhatsApp link with the whole order, for the "send it on WhatsApp instead" fallback. */
export function orderWhatsAppLink(order: Order): string {
  return getWhatsAppLink(orderToText(order));
}
