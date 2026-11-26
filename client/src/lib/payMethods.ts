/*
 * The ways to pay (owner, 2026-11-24: no online payments; the customer pays
 * with Bit or PayBox (one choice), bank transfer, or cash in Modiin). One
 * place for the number and the app links; the confirmation email has its own
 * copy (order-emails).
 *
 * Neither app documents a link with the amount filled in. Tested by the owner
 * on Android (2026-11-24): Bit's link opens the app and fills in nothing. So
 * the button copies the number and opens the app, and the screen has the rest.
 */

import { rpc } from "./supabase";

export type PayMethod = "bit_paybox" | "bank_transfer" | "cash";
export type PayApp = "bit" | "paybox";

/** What can be chosen for an area: cash only in Modiin (the database checks too) */
export const payMethodsFor = (zoneId: string | undefined): PayMethod[] =>
  zoneId === "modiin" ? ["bit_paybox", "bank_transfer", "cash"] : ["bit_paybox", "bank_transfer"];

/** Receives Bit and PayBox payments */
export const PAY_NUMBER = "0584132576";
export const PAY_NUMBER_DISPLAY = "058-413-2576";

/** The business owner's own Bit payment page (his, 2026-11-26): opens Bit straight on paying him */
const BIT_LINK = "https://www.bitpay.co.il/app/me/CD33CBC4-22FB-ACDD-2105-7CD2DF8DA3155344";

/** The owner's personal "PayBox for business" link, if there is one: opens straight on paying us */
const PAYBOX_LINK = "";

export function payMethodName(m: PayMethod, he: boolean): string {
  switch (m) {
    case "bit_paybox": return "Bit / PayBox";
    case "bank_transfer": return he ? "העברה בנקאית" : "Bank transfer";
    case "cash": return he ? "מזומן" : "Cash";
  }
}

/** Where "Open Bit" / "Open PayBox" goes, or null on a computer (the apps are on phones only) */
export function payAppLink(app: PayApp): string | null {
  const ua = navigator.userAgent;
  const android = /android/i.test(ua);
  const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (!android && !ios) return null;
  if (app === "bit") return BIT_LINK;
  if (PAYBOX_LINK) return PAYBOX_LINK;
  if (android) {
    const store = encodeURIComponent("https://play.google.com/store/apps/details?id=com.payboxapp");
    return `intent://links.payboxapp.com/#Intent;scheme=https;package=com.payboxapp;S.browser_fallback_url=${store};end`;
  }
  return "https://links.payboxapp.com/";
}

/** The customer says they've paid: recorded on the order and emailed to the owner */
export async function claimPayment(orderId: string): Promise<boolean> {
  try {
    const { data, error } = await rpc<boolean>("claim_payment", { p_order_id: orderId });
    return !error && data === true;
  } catch {
    return false;
  }
}

/** "Choose another way to pay" after ordering */
export async function changePayMethod(orderId: string, method: PayMethod): Promise<boolean> {
  try {
    const { data, error } = await rpc<boolean>("set_payment_method", { p_order_id: orderId, p_method: method });
    return !error && data === true;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and in-app browsers
    const t = document.createElement("textarea");
    t.value = text;
    t.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* nothing more to try */ }
    t.remove();
    return ok;
  }
}
