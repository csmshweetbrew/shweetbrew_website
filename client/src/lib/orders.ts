/*
 * ORDER SUBMISSION
 *
 * Orders go to Supabase through the `place_order` database function
 * (supabase/migrations/0008_place_order.sql). It looks every price up itself,
 * checks stock, applies the delivery fee and minimum, takes the stock and
 * returns the real SB-#### reference. The admin app reads orders from there.
 *
 * WhatsApp is only for contacting us; it plays no part in ordering.
 */

import { getSupabase } from "./supabase";
import type { PayMethod } from "./payMethods";

export type OrderLine = {
  productId?: string; // products.id in the database (variant id)
  product: string;
  category: string;
  size: string;
  quantity: number;
  price: number;
};

export type Order = {
  id?: string; // filled in by the database
  payMethod?: PayMethod;
  /** the database keeps how they pay, so "I've paid" and "Pay another way" work (migration 0018) */
  payTracked?: boolean;
  /** the customer pressed "I've paid" */
  claimed?: boolean;
  reference: string; // filled in by the database
  name: string;
  phone: string; // optional: "" when not given
  email: string;
  address: string; // one line, for display
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
  | { code: "EMAIL_NOT_CONFIRMED" }
  | { code: "NETWORK"; message: string };

export type SubmitResult = { ok: true; order: Order } | { ok: false; error: OrderError };

/** Turns the database's error message ("OUT_OF_STOCK:biltong-traditional:250g:3") into something typed. */
export function parseOrderError(message: string): OrderError {
  if (/EMAIL_NOT_CONFIRMED|permission denied for function place_order/.test(message)) return { code: "EMAIL_NOT_CONFIRMED" };
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

type PlaceOrderResponse = { id: string; reference: string; subtotal: number; delivery_fee: number | null; total: number; created_at: string; payment_method?: string | null };

export async function submitOrder(order: Order): Promise<SubmitResult> {
  try {
    const sb = await getSupabase();
    if (!sb) return { ok: false, error: { code: "NETWORK", message: "Supabase is not configured (.env)" } };
    const missing = order.lines.find((l) => !l.productId);
    if (missing) return { ok: false, error: { code: "UNAVAILABLE", productId: "", size: missing.size } };

    const { data, error } = await sb.rpc("place_order", {
      p_order: {
        name: order.name,
        phone: order.phone || null,
        email: order.email,
        zone_id: order.zoneId,
        city: order.city ?? "",
        street: order.street ?? "",
        apartment: order.apartment ?? "",
        notes: order.notes,
        language: order.language ?? "en",
        requested_delivery_date: order.requestedDeliveryDate ?? null,
        payment_method: order.payMethod ?? null,
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
        id: r.id,
        payTracked: !!r.payment_method,
        reference: r.reference,
        subtotal: Number(r.subtotal),
        deliveryFee: r.delivery_fee == null ? null : Number(r.delivery_fee),
        total: Number(r.total),
        createdAt: r.created_at,
      },
    };
  } catch (err) {
    return { ok: false, error: { code: "NETWORK", message: err instanceof Error ? err.message : String(err) } };
  }
}
