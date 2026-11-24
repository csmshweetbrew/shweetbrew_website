/*
 * ORDER SECTION (#order): the cart's checkout, laid out on the page.
 *
 * Same bag, same details, same rules and same database order as the cart
 * drawer: both use components/checkout (useCheckout + CheckoutFields +
 * OrderPlaced), and the typed details are shared through CartContext, so
 * filling them in here also fills the drawer and vice versa.
 *
 * Left: your bag (read-only summary, "Edit bag" opens the drawer) with totals.
 * Right: your details and Place order.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Pencil } from "lucide-react";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useCatalog } from "@/contexts/CatalogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { getCategoryNameHebrew, getTranslatedProductName } from "@/config/products";
import { findVariant } from "@/lib/catalog";
import { productThumb } from "@/lib/images";
import { openCart } from "@/lib/shopFilter";
import { scrollToTarget } from "@/lib/smoothScroll";
import type { Order } from "@/lib/orders";
import { useCheckout } from "./checkout/useCheckout";
import CheckoutFields, { CheckoutProblems } from "./checkout/CheckoutFields";
import OrderPlaced from "./checkout/OrderPlaced";

export default function OrderForm() {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const t = translations.checkout;
  const { items, subtotal } = useCart();
  const { categories } = useCatalog();
  const sectionRef = useRef<HTMLElement>(null);
  const checkout = useCheckout(sectionRef);
  const [placed, setPlaced] = useState<Order | null>(null);
  // A new bag after an order: back to the form
  useEffect(() => {
    if (items.length) setPlaced(null);
  }, [items.length]);

  // One line per product, its packs summed by size: "500g × 2 · 100g"
  const groups = useMemo(() => {
    const map = new Map<string, { first: CartItem; sizes: Map<string, number>; total: number }>();
    for (const item of items) {
      const key = `${item.categoryName}|${item.productName}`;
      const g = map.get(key) ?? { first: item, sizes: new Map<string, number>(), total: 0 };
      g.sizes.set(item.size, (g.sizes.get(item.size) ?? 0) + item.quantity);
      g.total += item.price * item.quantity;
      map.set(key, g);
    }
    return Array.from(map.entries());
  }, [items]);

  const placeOrder = async () => {
    const order = await checkout.placeOrder();
    if (order) setPlaced(order);
  };

  return (
    <section ref={sectionRef} id="order" className="py-16 px-4" style={{ backgroundColor: "var(--background)", borderTop: "3px solid var(--accent)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="section-title mb-4">{t.title[language]}</h2>
          <p style={{ color: "var(--brand-cream-dim)" }} className="text-base md:text-lg">
            {t.reviewYourOrder[language]}
          </p>
        </div>

        {placed ? (
          <div className="order-panel max-w-xl mx-auto">
            <OrderPlaced order={placed} onDone={() => { setPlaced(null); scrollToTarget("#products"); }} />
          </div>
        ) : items.length === 0 ? (
          <div className="order-panel text-center max-w-xl mx-auto">
            <p style={{ color: "var(--brand-cream-dim)" }} className="mb-6">{t.cartEmpty[language]}</p>
            <button type="button" className="order-cta" onClick={() => scrollToTarget("#products")}>
              <ArrowUp className="w-4 h-4" />
              {t.addProducts[language]}
            </button>
          </div>
        ) : (
          <div className="order-layout">
            {/* ---------- Your bag ---------- */}
            <div className="order-panel">
              <div className="order-panel-head">
                <h3>{t.orderSummary[language]}</h3>
                <button type="button" className="cart-link order-edit" onClick={openCart}>
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  {L("Edit bag", "עריכת הסל")}
                </button>
              </div>
              <ul className="order-lines">
                {groups.map(([key, g]) => {
                  const variant = findVariant(categories, g.first.categoryName, g.first.productName);
                  const name = (variant && getTranslatedProductName(variant.id, language)) || g.first.productName;
                  const category = he ? getCategoryNameHebrew(g.first.categoryName.toUpperCase()) : g.first.categoryName;
                  const sizes = Array.from(g.sizes.entries()).map(([size, n]) => (n > 1 ? `${size} × ${n}` : size)).join(" · ");
                  return (
                    <li key={key} className="order-line">
                      <img src={productThumb(g.first.image)} alt="" className="cart-thumb" loading="lazy" decoding="async" />
                      <span className="min-w-0">
                        <span className="order-line-name">{name}</span>
                        <span className="order-line-meta">{category} · <span dir="ltr">{sizes}</span></span>
                      </span>
                      <span className="order-line-price">₪{g.total}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="cart-totals order-totals">
                <div><dt>{L("Subtotal", "סכום ביניים")}</dt><dd>₪{subtotal}</dd></div>
                <div><dt>{L("Delivery", "משלוח")}</dt><dd>{checkout.deliveryText}</dd></div>
                <div className="cart-grand"><dt>{L("Total", "סה\"כ")}</dt><dd>₪{checkout.total}</dd></div>
              </dl>
            </div>

            {/* ---------- Your details ---------- */}
            <div className="order-panel">
              <div className="order-panel-head">
                <h3>{t.yourDetails[language]}</h3>
              </div>
              <CheckoutFields checkout={checkout} idPrefix="order" />
              <CheckoutProblems checkout={checkout} idPrefix="order" />
              {checkout.orderError && (
                <p className="cart-min cart-order-error order-error" role="alert">{checkout.orderError}</p>
              )}
              <button type="button" className="cart-primary order-submit" onClick={placeOrder} disabled={checkout.submitting} aria-busy={checkout.submitting}>
                {checkout.submitting ? L("Placing your order…", "שולחים את ההזמנה…") : `${L("Place order", "ביצוע הזמנה")} · ₪${checkout.total}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
