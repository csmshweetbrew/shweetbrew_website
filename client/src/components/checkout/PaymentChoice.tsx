/* How the customer will pay: the last thing in the checkout form. Nothing is charged here.
   Cash shows only for Modiin. */

import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { payMethodName } from "@/lib/payMethods";
import type { Checkout } from "./useCheckout";

export default function PaymentChoice({ checkout, idPrefix }: { checkout: Checkout; idPrefix: string }) {
  const { language } = useLanguage();
  const he = language === "he";
  const { setPayMethod } = useCart();
  return (
    <fieldset className="pay-choice">
      <legend>{he ? "איך תרצו לשלם?" : "How would you like to pay?"}</legend>
      {checkout.payMethods.map((m) => (
        <label key={m} className="pay-option">
          <input type="radio" name={`${idPrefix}-payment`} value={m} checked={checkout.payMethod === m} onChange={() => setPayMethod(m)} />
          <span className="pay-dot" aria-hidden="true" />
          <strong>{payMethodName(m, he)}</strong>
        </label>
      ))}
    </fieldset>
  );
}
