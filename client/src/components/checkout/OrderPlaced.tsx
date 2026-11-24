/* "Order placed": the same confirmation wherever the order was placed from, with
   how to pay (PayPanel) and a way to switch (PayAnotherWay). */

import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order } from "@/lib/orders";
import PayAnotherWay from "./PayAnotherWay";
import PayPanel from "./PayPanel";

export default function OrderPlaced({ order, onDone }: { order: Order; onDone: () => void }) {
  const { language } = useLanguage();
  const L = (en: string, hebrew: string) => (language === "he" ? hebrew : en);
  const first = order.name.split(" ")[0];
  const waiting = L(`Thanks ${first}. We've got your order and it's awaiting confirmation. `, `תודה ${first}. קיבלנו את ההזמנה והיא ממתינה לאישור. `);
  // What we'll get in touch about, by how they'll pay (no final total yet while delivery is to be arranged)
  const about = order.deliveryFee === null
    ? L("the delivery price and the final total.", "את מחיר המשלוח והסכום הסופי.")
    : order.payMethod === "bank_transfer"
      ? L("the delivery time and send the bank details.", "את זמן המשלוח ונשלח את פרטי הבנק.")
      : order.payMethod === "cash"
        ? L("the delivery time. You pay in cash when you get it.", "את זמן המשלוח. משלמים במזומן בקבלה.")
        : L("the delivery time.", "את זמן המשלוח.");
  return (
    <div className="cart-placed" role="status">
      <span className="cart-placed-mark"><Check className="w-7 h-7" strokeWidth={3} /></span>
      <p className="cart-placed-ref">{order.reference}</p>
      <p>
        {order.phone
          ? <>{waiting}{L("We'll call or message ", "ניצור קשר במספר ")}<span dir="ltr">{order.phone}</span>{L(" to confirm ", " כדי לאשר ")}{about}</>
          : waiting + L("We'll email you to confirm ", "נשלח לכם מייל כדי לאשר ") + about}
      </p>
      <PayPanel order={order} />
      {!(order.payMethod === "bit_paybox" && order.deliveryFee !== null) && (
        <p className="cart-placed-total">{L("Total", "סה\"כ")} ₪{order.total}</p>
      )}
      <PayAnotherWay order={order} />
      <button type="button" className="cart-secondary" onClick={onDone}>
        {L("Back to the shop", "חזרה לחנות")}
      </button>
    </div>
  );
}
