/*
 * The checkout rules, in one place. Used by the cart drawer (CartPanel) and the
 * Order section (OrderForm), so both check, price and place orders the same way:
 *
 *   - confirmed email (code) required, area, name and phone required
 *   - ₪80 minimum for delivery, except Modiin pickup
 *   - delivery fee and total from the chosen area
 *   - the order goes to the database (lib/orders.ts → place_order), which
 *     re-checks prices, stock, the minimum and the confirmed email itself
 *
 * The typed details live in CartContext, so both places share them.
 */

import { useEffect, useState, type RefObject } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedProductName } from "@/config/products";
import { deliveryZones, getNextDeliveryDate, type DeliveryZone } from "@/config/deliveryZones";
import { findVariant, findVariantById } from "@/lib/catalog";
import { submitOrder, type Order, type OrderError } from "@/lib/orders";
import { getSupabase } from "@/lib/supabase";

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

  const { items, subtotal, selectedArea, name, phone, notes, shippingDetails: street, city, apartment, clearCart } = useCart();
  const { categories, refresh: refreshCatalog } = useCatalog();
  const { user, enabled: accountsOn, refreshProfile } = useAuth();

  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<OrderError | null>(null);
  /** "Save these details for next time" (signed in only; on by default) */
  const [saveDetails, setSaveDetails] = useState(true);

  const zone: DeliveryZone | undefined = deliveryZones.find((z) => z.id === selectedArea);
  const feeKnown = zone ? zone.price >= 0 : false;
  const deliveryFee = zone && zone.price > 0 ? zone.price : 0;
  const total = subtotal + deliveryFee;
  const belowMinimum = !!zone && zone.id !== "modiin" && subtotal < MIN_DELIVERY_ORDER;
  const nextDeliveryDate = zone ? getNextDeliveryDate(zone) : null;
  const deliveryText = !zone ? "—" : zone.price === 0 ? L("Free", "חינם") : zone.price < 0 ? L("To arrange", "בתיאום") : `₪${zone.price}`;

  const errors = {
    email: accountsOn && !user ? L("Confirm your email with the code to place the order.", "אמתו את המייל עם הקוד כדי לבצע את ההזמנה.") : "",
    zone: !zone ? L("Choose where it's going.", "בחרו לאן לשלוח.") : "",
    name: !name.trim() ? L("Add your name.", "הוסיפו שם.") : "",
    phone: !/^[0-9+\-\s()]{9,}$/.test(phone.trim()) ? L("Add a phone number we can reach.", "הוסיפו מספר טלפון.") : "",
  };
  const hasErrors = !!(errors.email || errors.zone || errors.name || errors.phone);

  // A changed bag or area makes an old order error stale
  useEffect(() => setOrderError(null), [items, selectedArea]);

  /** What went wrong with the order, in the visitor's language */
  const errorText = (err: OrderError): string => {
    const item = "productId" in err ? findVariantById(categories, err.productId) : null;
    const what = item ? `${getTranslatedProductName(item.variant.id, language) || item.variant.name} ${"size" in err ? err.size : ""}`.trim() : "";
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
          : L("Check your details and try again.", "בדקו את הפרטים ונסו שוב.");
      case "EMAIL_NOT_CONFIRMED":
        return L("Confirm your email with the code first.", "קודם אמתו את המייל עם הקוד.");
      case "TOO_MANY_ORDERS":
        return L("You've just placed a few orders. Contact us if you need to change one.", "ביצעתם כמה הזמנות ממש עכשיו. צרו איתנו קשר אם צריך לשנות משהו.");
      default:
        return L("We couldn't send your order. Please try again in a moment.", "לא הצלחנו לשלוח את ההזמנה. נסו שוב בעוד רגע.");
    }
  };

  /** Checks, then places the order. Resolves to the placed order, or null if it didn't go through. */
  const placeOrder = async (): Promise<Order | null> => {
    if (submitting) return null;
    if (hasErrors || belowMinimum) {
      setTried(true);
      // setTimeout, not requestAnimationFrame: works while the tab is in the background too
      window.setTimeout(() => rootRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
      return null;
    }
    const order: Order = {
      reference: "",
      name: name.trim(),
      phone: phone.trim(),
      address: [street.trim(), apartment.trim(), city.trim()].filter(Boolean).join(", "),
      city: city.trim(),
      street: street.trim(),
      apartment: apartment.trim(),
      zoneId: zone!.id,
      zoneName: zone!.name,
      notes: notes.trim(),
      language: he ? "he" : "en",
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
      return null;
    }
    setTried(false);
    // Remember the details as this customer's defaults (works the same for Google, password
    // and code accounts). The database already fills empty profile fields on every order;
    // this also replaces older saved details when the box is ticked.
    if (user && saveDetails) {
      try {
        const sb = await getSupabase();
        await sb?.from("profiles").update({
          full_name: order.name || null,
          phone: order.phone || null,
          city: order.city || null,
          street: order.street || null,
          apartment: order.apartment || null,
          default_zone_id: order.zoneId,
        }).eq("id", user.id);
      } catch {
        // not critical: the order went through
      }
    }
    clearCart();
    void refreshProfile();
    return result.order;
  };

  return {
    zone,
    subtotal,
    deliveryFee,
    deliveryText,
    total,
    belowMinimum,
    nextDeliveryDate,
    errors,
    tried,
    submitting,
    orderError: orderError ? errorText(orderError) : "",
    placeOrder,
    signedIn: !!user,
    saveDetails,
    setSaveDetails,
  };
}

export type Checkout = ReturnType<typeof useCheckout>;
