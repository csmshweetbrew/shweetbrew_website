/*
 * ORDER SUBMISSION — PLACEHOLDER
 *
 * The site is moving to in-website orders. Until a real backend (database,
 * payment, email/SMS confirmation) is connected, `submitOrder` is a stub:
 *
 *  - it builds an order with a short reference number;
 *  - because nothing stores orders yet, it ALSO opens WhatsApp with the full
 *    order filled in, so no real order is lost while the backend is missing.
 *
 * To go live: set ORDER_BACKEND_READY to true and replace the body of
 * `sendToBackend` with a call to your API. The WhatsApp fallback then stops.
 */

import { getWhatsAppLink } from "@/config/site";

export const ORDER_BACKEND_READY = false;

export type OrderLine = { product: string; category: string; size: string; quantity: number; price: number };

export type Order = {
  reference: string;
  name: string;
  phone: string;
  address: string;
  zoneId: string;
  zoneName: string;
  notes: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number | null; // null = to arrange
  total: number;
  createdAt: string;
};

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

async function sendToBackend(_order: Order): Promise<void> {
  // TODO: POST the order to the real ordering API once it exists.
  throw new Error("Order backend not connected yet");
}

/**
 * Must be called directly from the click handler: the WhatsApp fallback opens a
 * new tab, which browsers only allow during a user click.
 */
export function submitOrder(order: Order): { ok: true } {
  if (ORDER_BACKEND_READY) {
    void sendToBackend(order);
  } else {
    window.open(getWhatsAppLink(orderToText(order)), "_blank", "noopener");
  }
  return { ok: true };
}
