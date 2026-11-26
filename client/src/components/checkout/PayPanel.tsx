/*
 * "Pay ₪155 with Bit or PayBox" on the order-placed screen: the number, the
 * amount and the order number to copy; on a phone, buttons that copy the number
 * and open the app; and "I've paid", which tells the owner (they still check).
 */

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order } from "@/lib/orders";
import { claimPayment, copyText, payAppLink, PAY_NUMBER, PAY_NUMBER_DISPLAY, type PayApp } from "@/lib/payMethods";

const APPS: { id: PayApp; name: string }[] = [{ id: "bit", name: "Bit" }, { id: "paybox", name: "PayBox" }];

export default function PayPanel({ order }: { order: Order }) {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const { updatePlaced } = useCart();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only once the total is final (not while delivery is to be arranged)
  if (order.payMethod !== "bit_paybox" || order.deliveryFee === null) return null;
  const links = APPS.map((a) => ({ ...a, href: payAppLink(a.id) })).filter((a) => a.href);

  const claim = async () => {
    if (busy || !order.id) return;
    setBusy(true);
    setFailed(false);
    const ok = await claimPayment(order.id);
    setBusy(false);
    if (ok) updatePlaced({ claimed: true });
    else setFailed(true);
  };

  return (
    <div className="pay-panel">
      <h3>{he ? <>תשלום ₪{order.total} <span className="whitespace-nowrap">ב-Bit או PayBox</span></> : `Pay ₪${order.total} with Bit or PayBox`}</h3>
      <dl>
        <CopyRow label={L("To", "אל")} shown={PAY_NUMBER_DISPLAY} value={PAY_NUMBER} />
        <CopyRow label={L("Amount", "סכום")} shown={`₪${order.total}`} value={String(order.total)} />
        <CopyRow label={L("Note", "הערה")} shown={order.reference} value={order.reference} />
      </dl>
      {order.claimed ? (
        <p className="pay-claimed" role="status">
          <span className="pay-tick" aria-hidden="true"><Check className="w-3.5 h-3.5" strokeWidth={3.5} /></span>
          {L("Thanks! We'll check it and confirm.", "תודה! נבדוק ונאשר.")}
        </p>
      ) : (
        <>
          {links.length > 0 && (
            <div className="pay-open-row">
              {links.map((a) => (
                <a key={a.id} className="cart-primary pay-open" href={a.href!} onClick={() => { void copyText(PAY_NUMBER); }} aria-label={L(`Copy the number and open ${a.name}`, `העתקת המספר ופתיחת ${a.name}`)}>
                  {L(`Open ${a.name}`, `פתיחת ${a.name}`)}
                </a>
              ))}
            </div>
          )}
          {/* Only when the database can record it (migration 0018) */}
          {order.payTracked && (
            <button type="button" className="cart-secondary pay-done" onClick={claim} disabled={busy} aria-busy={busy}>
              {busy ? L("One moment…", "רק רגע…") : L("I've paid", "שילמתי")}
            </button>
          )}
          {failed && <p className="cart-err" role="alert">{L("That didn't go through. Try again in a moment.", "זה לא עבר. נסו שוב בעוד רגע.")}</p>}
        </>
      )}
    </div>
  );
}

function CopyRow({ label, shown, value }: { label: string; shown: string; value: string }) {
  const { language } = useLanguage();
  const he = language === "he";
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="pay-row">
      <dt>{label}</dt>
      <dd dir="ltr">{shown}</dd>
      <dd>
        <button type="button" className={`pay-copy ${copied ? "is-copied" : ""}`} onClick={copy} aria-label={he ? `העתקת ${label}: ${shown}` : `Copy ${label}: ${shown}`}>
          <span aria-live="polite">{copied ? (he ? "הועתק" : "Copied") : (he ? "העתקה" : "Copy")}</span>
        </button>
      </dd>
    </div>
  );
}
