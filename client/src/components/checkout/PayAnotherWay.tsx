/*
 * "Choose another way to pay" on the order-placed screen: switch between Bit / PayBox,
 * bank transfer and (Modiin only) cash, until they've said they paid. The owner
 * is emailed about the switch.
 */

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order } from "@/lib/orders";
import { changePayMethod, payMethodName, payMethodsFor, type PayMethod } from "@/lib/payMethods";

export default function PayAnotherWay({ order }: { order: Order }) {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const { updatePlaced } = useCart();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<PayMethod | null>(null);
  const [failed, setFailed] = useState(false);

  // Needs migration 0018; nothing to change once they've said they paid
  if (!order.id || !order.payTracked || order.claimed) return null;

  const choose = async (m: PayMethod) => {
    if (busy) return;
    setBusy(m);
    setFailed(false);
    const ok = await changePayMethod(order.id!, m);
    setBusy(null);
    if (!ok) return setFailed(true);
    updatePlaced({ payMethod: m });
    setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" className="cart-secondary pay-switch" onClick={() => setOpen(true)} aria-expanded="false">
        {L("Choose another way to pay", "בחירת דרך תשלום אחרת")}
      </button>
    );
  }
  return (
    <div className="pay-others" role="group" aria-label={L("Choose another way to pay", "בחירת דרך תשלום אחרת")}>
      <strong>{L("Choose another way to pay", "בחירת דרך תשלום אחרת")}</strong>
      {payMethodsFor(order.zoneId).filter((m) => m !== order.payMethod).map((m) => (
        <button key={m} type="button" className="cart-secondary" onClick={() => choose(m)} disabled={!!busy} aria-busy={busy === m}>
          {busy === m ? L("One moment…", "רק רגע…") : payMethodName(m, he)}
        </button>
      ))}
      {failed && <p className="cart-err" role="alert">{L("That didn't go through. Try again, or contact us.", "זה לא עבר. נסו שוב, או צרו איתנו קשר.")}</p>}
    </div>
  );
}
