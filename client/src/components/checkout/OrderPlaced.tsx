/* "Order placed": the same confirmation wherever the order was placed from. */

import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order } from "@/lib/orders";

export default function OrderPlaced({ order, onDone }: { order: Order; onDone: () => void }) {
  const { language } = useLanguage();
  const L = (en: string, hebrew: string) => (language === "he" ? hebrew : en);
  const { user } = useAuth();
  const first = order.name.split(" ")[0];
  return (
    <div className="cart-placed" role="status">
      <span className="cart-placed-mark"><Check className="w-7 h-7" strokeWidth={3} /></span>
      <p className="cart-placed-ref">{order.reference}</p>
      <p>
        {order.phone
          ? L(
              `Thanks ${first}. We'll call or message ${order.phone} to confirm the delivery time and payment.`,
              `תודה ${first}. ניצור קשר במספר ${order.phone} כדי לאשר זמן משלוח ותשלום.`
            )
          : L(
              `Thanks ${first}. We'll email you to confirm the delivery time and payment.`,
              `תודה ${first}. נשלח לכם מייל כדי לאשר זמן משלוח ותשלום.`
            )}
      </p>
      <p className="cart-placed-total">{L("Total", "סה\"כ")} ₪{order.total}</p>
      {user?.email && (
        <p className="cart-placed-track">
          {L("To track it, log in any time with", "כדי לעקוב, התחברו מתי שתרצו עם")} <strong dir="ltr">{user.email}</strong>
          {L(" (a code is enough, no password needed).", " (מספיק קוד, בלי סיסמה).")}
        </p>
      )}
      <button type="button" className="cart-secondary" onClick={onDone}>
        {L("Back to the shop", "חזרה לחנות")}
      </button>
    </div>
  );
}
