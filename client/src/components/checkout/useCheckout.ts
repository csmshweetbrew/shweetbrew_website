/*
 * The checkout rules, in one place. Used by the cart drawer (CartPanel) and the
 * Order section (OrderForm), so both check, price and place orders the same way:
 *
 *   - no accounts (owner, 2026-11-24): area, name and email required, the email
 *     typed twice (plus a "did you mean gmail.com?" typo hint); phone optional
 *   - errors show as soon as a field is left, and "Place order" with
 *     something missing lists every problem above the button
 *   - ₪80 minimum for delivery, except Modiin pickup
 *   - delivery fee and total from the chosen area
 *   - how they'll pay (Bit / PayBox, bank transfer, cash in Modiin only): kept on the order, nothing is charged
 *   - the order goes to the database (lib/orders.ts → place_order), which
 *     re-checks prices, stock and the minimum itself
 *
 * The typed details, shown errors and "being sent" state all live in
 * CartContext, so both places always behave the same.
 */

import { useEffect, useState, type RefObject } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedProductName, sizeLabel } from "@/config/products";
import { deliveryZones, getNextDeliveryDate, type DeliveryZone } from "@/config/deliveryZones";
import { findVariant, findVariantById } from "@/lib/catalog";
import { submitOrder, type Order, type OrderError } from "@/lib/orders";
import { suggestEmail } from "@/lib/emailTypos";
import { payMethodsFor } from "@/lib/payMethods";

export const MIN_DELIVERY_ORDER = 80;
export const OTHER_ZONE = "zone_everywhere_else";

/** yyyy-mm-dd in local time (what the delivery date line showed) */
function toIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useCheckout(rootRef: RefObject<HTMLElement | null>) {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);

  const { items, subtotal, selectedArea, name, phone, notes, shippingDetails: street, city, apartment, email, setEmail, emailAgain, setEmailAgain, clearCart,
    tried, setTried, touched, touch, submitting, setSubmitting, payMethod: chosenMethod, setPlaced } = useCart();
  const { categories, refresh: refreshCatalog } = useCatalog();
  const typedEmail = email.trim();

  const [orderError, setOrderError] = useState<OrderError | null>(null);

  const zone: DeliveryZone | undefined = deliveryZones.find((z) => z.id === selectedArea);
  const feeKnown = zone ? zone.price >= 0 : false;
  const deliveryFee = zone && zone.price > 0 ? zone.price : 0;
  const total = subtotal + deliveryFee;
  // Cash chosen and then another area picked: back to the first choice
  const payMethods = payMethodsFor(zone?.id);
  const payMethod = payMethods.includes(chosenMethod) ? chosenMethod : payMethods[0];
  const belowMinimum = !!zone && zone.id !== "modiin" && subtotal < MIN_DELIVERY_ORDER;
  const nextDeliveryDate = zone ? getNextDeliveryDate(zone) : null;
  const deliveryText = !zone ? "—" : zone.price === 0 ? L("Free", "חינם") : zone.price < 0 ? L("To arrange", "בתיאום") : `₪${zone.price}`;

  // The email is required (owner, 2026-11-24): every order gets a confirmation email
  const errors = {
    zone: !zone ? L("Choose where it's going.", "בחרו לאן לשלוח.") : "",
    name: !name.trim() ? L("Add your name.", "הוסיפו שם.") : "",
    // Optional, but a number that can't work is still pointed out (same rule as the database)
    phone: phone.trim() && !/^\+?[0-9][0-9 ()-]{6,24}$/.test(phone.trim()) ? L("Check the phone number, or leave it empty.", "בדקו את מספר הטלפון, או השאירו ריק.") : "",
    email: !typedEmail
      ? L("Add your email for the order confirmation.", "הוסיפו מייל לאישור ההזמנה.")
      : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(typedEmail) ? L("Check the email address.", "בדקו את כתובת המייל.") : "",
    emailAgain: !emailAgain.trim()
      ? L("Type your email again.", "הקלידו את המייל שוב.")
      : emailAgain.trim().toLowerCase() !== typedEmail.toLowerCase() ? L("The two emails don't match.", "שני המיילים לא תואמים.") : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  /** Show a field's error once it was left, or after "Place order" was pressed */
  const show = (field: keyof typeof errors) => (tried || touched[field] ? errors[field] : "");
  const emailSuggestion = suggestEmail(typedEmail);
  /** Accept the suggestion; if the same typo was typed twice, fix both */
  const acceptSuggestion = () => {
    if (!emailSuggestion) return;
    if (emailAgain.trim().toLowerCase() === typedEmail.toLowerCase()) setEmailAgain(emailSuggestion);
    setEmail(emailSuggestion);
  };

  /** Everything still stopping the order, in form order, for the list above the button */
  const problems: { field: string; text: string }[] = [
    errors.zone && { field: "area", text: L("Choose a delivery area", "בחרו אזור משלוח") },
    errors.name && { field: "name", text: L("Add your name", "הוסיפו שם") },
    errors.phone && { field: "phone", text: L("Check your phone number", "בדקו את מספר הטלפון") },
    errors.email && { field: "email", text: typedEmail ? L("Check your email address", "בדקו את כתובת המייל") : L("Add your email", "הוסיפו מייל") },
    errors.emailAgain && { field: "emailAgain", text: emailAgain.trim() ? L("Make the two emails match", "ודאו ששני המיילים תואמים") : L("Type your email again", "הקלידו את המייל שוב") },
    belowMinimum && { field: "", text: L(`Delivery starts at ₪${MIN_DELIVERY_ORDER}: add ₪${MIN_DELIVERY_ORDER - subtotal} more, or choose Modiin pickup`, `משלוח מ-₪${MIN_DELIVERY_ORDER}: הוסיפו עוד ₪${MIN_DELIVERY_ORDER - subtotal}, או בחרו איסוף במודיעין`) },
  ].filter(Boolean) as { field: string; text: string }[];

  // A changed bag or area makes an old order error stale
  useEffect(() => setOrderError(null), [items, selectedArea]);

  /** What went wrong with the order, in the visitor's language */
  const errorText = (err: OrderError): string => {
    const item = "productId" in err ? findVariantById(categories, err.productId) : null;
    const what = item ? `${getTranslatedProductName(item.variant.id, language) || item.variant.name} ${"size" in err ? sizeLabel(err.size, language) : ""}`.trim() : "";
    switch (err.code) {
      case "OUT_OF_STOCK":
        return err.left > 0
          ? L(`Sorry, only ${err.left} left of ${what}. Lower the number to continue.`, `מצטערים, נשארו רק ${err.left} של ${what}. הורידו את הכמות כדי להמשיך.`)
          : L(`Sorry, ${what} just sold out. Remove it to continue.`, `מצטערים, ${what} אזל הרגע. הסירו אותו כדי להמשיך.`);
      case "UNAVAILABLE":
        return what
          ? L(`${what} isn't available right now. Remove it to continue.`, `${what} לא זמין כרגע. הסירו אותו כדי להמשיך.`)
          : L("Something in your bag isn't available any more. Remove it to continue.", "משהו בסל כבר לא זמין. הסירו אותו כדי להמשיך.");
      case "BELOW_MINIMUM":
        return L(`Delivery starts at ₪${err.min}. Add a little more, or choose Modiin for pickup.`, `משלוח מ-₪${err.min}. הוסיפו עוד קצת, או בחרו איסוף במודיעין.`);
      case "INVALID_INPUT":
        return err.field === "phone"
          ? L("Check the phone number and try again.", "בדקו את מספר הטלפון ונסו שוב.")
          : err.field === "payment_method"
            ? L("Cash is only available in Modiin. Choose another way to pay.", "מזומן אפשרי רק במודיעין. בחרו דרך תשלום אחרת.")
          : err.field === "email"
            ? L("Check the email address and try again.", "בדקו את כתובת המייל ונסו שוב.")
            : L("Check your details and try again.", "בדקו את הפרטים ונסו שוב.");
      case "EMAIL_NOT_CONFIRMED":
        // Only from a database that hasn't had migration 0015 yet
        return L("Ordering is being updated. Please try again in a few minutes.", "ההזמנות מתעדכנות. נסו שוב בעוד כמה דקות.");
      case "TOO_MANY_ORDERS":
        return L("You've just placed a few orders. Contact us if you need to change one.", "ביצעתם כמה הזמנות ממש עכשיו. צרו איתנו קשר אם צריך לשנות משהו.");
      default:
        return L("We couldn't send your order. Please try again in a moment.", "לא הצלחנו לשלוח את ההזמנה. נסו שוב בעוד רגע.");
    }
  };

  /** Checks, then places the order. The "Order placed" screen (CartContext.placed) shows when it went through. */
  const placeOrder = async (): Promise<void> => {
    if (submitting) return;
    if (hasErrors || belowMinimum) {
      setTried(true);
      // setTimeout, not requestAnimationFrame: works while the tab is in the background too
      window.setTimeout(() => rootRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
      return;
    }
    const order: Order = {
      reference: "",
      name: name.trim(),
      phone: phone.trim(),
      email: typedEmail,
      address: [street.trim(), apartment.trim(), city.trim()].filter(Boolean).join(", "),
      city: city.trim(),
      street: street.trim(),
      apartment: apartment.trim(),
      zoneId: zone!.id,
      zoneName: zone!.name,
      notes: notes.trim(),
      language: he ? "he" : "en",
      payMethod,
      requestedDeliveryDate: nextDeliveryDate && zone!.id !== OTHER_ZONE ? toIsoDate(nextDeliveryDate) : undefined,
      lines: items.map((i) => ({
        productId: findVariant(categories, i.categoryName, i.productName)?.id,
        product: i.productName,
        category: i.categoryName,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal,
      deliveryFee: feeKnown ? deliveryFee : null,
      total,
      createdAt: new Date().toISOString(),
    };
    setOrderError(null);
    setSubmitting(true);
    const result = await submitOrder(order);
    setSubmitting(false);
    if (!result.ok) {
      setOrderError(result.error);
      if (result.error.code === "OUT_OF_STOCK" || result.error.code === "UNAVAILABLE") void refreshCatalog();
      return;
    }
    setTried(false);
    clearCart();
    setPlaced(result.order);
  };

  return {
    zone,
    subtotal,
    deliveryFee,
    deliveryText,
    total,
    belowMinimum,
    payMethods,
    payMethod,
    nextDeliveryDate,
    errors,
    show,
    touch,
    problems,
    emailSuggestion,
    acceptSuggestion,
    tried,
    submitting,
    orderError: orderError ? errorText(orderError) : "",
    placeOrder,
  };
}

export type Checkout = ReturnType<typeof useCheckout>;
