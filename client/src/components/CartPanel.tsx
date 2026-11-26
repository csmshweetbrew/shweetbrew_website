/*
 * SHWEETBREW CART — two-step drawer
 *
 * Step 1 "Bag": one block per product. Every pack is its own small row with its
 * own size, so 1.5kg can be 1kg + 500g instead of 500g x3. The + on a product
 * adds another row (same size as the last one); each row can change size or be
 * removed.
 * Step 2 "Details": the shared checkout form (components/checkout): confirmed
 * email, delivery area, name, phone, address, note. The Order section on the
 * page uses the very same form and rules (useCheckout).
 * Then the "Order placed" screen (shared with the Order section).
 *
 * Closes on the X, a click outside, or Escape.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingBag, X, Plus, Minus, ChevronLeft } from "lucide-react";
import { getTranslatedProductName, sizeLabel } from "@/config/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { findVariant as findCatalogVariant } from "@/lib/catalog";
import { productThumb } from "@/lib/images";
import { scrollToTarget, lockPageScroll } from "@/lib/smoothScroll";
import { OPEN_CART_EVENT } from "@/lib/shopFilter";
import { useCheckout } from "./checkout/useCheckout";
import CheckoutFields, { CheckoutProblems } from "./checkout/CheckoutFields";
import OrderPlaced from "./checkout/OrderPlaced";

type Step = 1 | 2;

export default function CartPanel() {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const { items, addItem, updateQuantity, subtotal, placed, setPlaced, placedRestored } = useCart();

  const { categories } = useCatalog();
  const findVariant = (categoryName: string, productName: string) => findCatalogVariant(categories, categoryName, productName);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const checkout = useCheckout(panelRef);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;
    // Capture phase + composedPath(): the path is fixed when the press starts, so a button
    // inside the cart that disappears on click (a removed row, a chosen area) still counts as inside.
    const onDown = (e: PointerEvent) => {
      const path = e.composedPath();
      if ((panelRef.current && path.includes(panelRef.current)) || (toggleRef.current && path.includes(toggleRef.current))) return;
      setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // "Edit bag" in the Order section opens the drawer on the bag
  useEffect(() => {
    const open = () => {
      setStep(1);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_CART_EVENT, open);
    return () => window.removeEventListener(OPEN_CART_EVENT, open);
  }, []);

  // Freeze the page behind the open drawer
  useEffect(() => {
    lockPageScroll(isOpen);
    return () => lockPageScroll(false);
  }, [isOpen]);

  // Back to the bag when it empties. The "Order placed" screen stays until "Back to the shop"
  // or a new bag, so closing the drawer by accident doesn't lose the payment details.
  useEffect(() => {
    if (!items.length && step === 2) setStep(1);
  }, [items.length, step]);
  // The phone dropped the page while the customer was paying in another app: show it again
  useEffect(() => {
    if (placedRestored) setIsOpen(true);
  }, [placedRestored]);

  /* ---------- bag grouping: one block per product, one row per pack ---------- */
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; first: CartItem; packs: CartItem[] }>();
    for (const item of items) {
      const key = `${item.categoryName}|${item.productName}`;
      const g = map.get(key) ?? { key, first: item, packs: [] };
      for (let i = 0; i < item.quantity; i++) g.packs.push(item);
      map.set(key, g);
    }
    // keep packs in size order inside each product
    const list = Array.from(map.values());
    list.forEach((g) => {
      const sizes = findVariant(g.first.categoryName, g.first.productName)?.sizes.map((s) => s.size) ?? [];
      g.packs.sort((a: CartItem, b: CartItem) => sizes.indexOf(a.size) - sizes.indexOf(b.size));
    });
    return list;
  }, [items, categories]);

  const addPack = (base: CartItem, size: string) => {
    const variant = findVariant(base.categoryName, base.productName);
    const price = variant?.sizes.find((s) => s.size === size)?.price ?? base.price;
    addItem({ ...base, id: `${base.categoryName}-${base.productName}-${size}`, size, price, quantity: 1 });
  };
  const removePack = (pack: CartItem) => {
    const current = items.find((i) => i.id === pack.id && i.size === pack.size);
    if (current) updateQuantity(current.id, current.size, current.quantity - 1);
  };
  /** Set how many packs of a product are in the bag: adds rows (same size as the last one) or removes from the end */
  const setPackCount = (packs: CartItem[], target: number) => {
    const n = Math.max(0, Math.min(99, Math.round(target)));
    if (n > packs.length) {
      const last = packs[packs.length - 1];
      const variant = findVariant(last.categoryName, last.productName);
      const price = variant?.sizes.find((s) => s.size === last.size)?.price ?? last.price;
      addItem({ ...last, id: `${last.categoryName}-${last.productName}-${last.size}`, price, quantity: n - packs.length });
    } else if (n < packs.length) {
      const drop = new Map<string, { item: CartItem; k: number }>();
      packs.slice(n).forEach((p) => {
        const key = `${p.id}|${p.size}`;
        const entry = drop.get(key) ?? { item: p, k: 0 };
        entry.k += 1;
        drop.set(key, entry);
      });
      drop.forEach(({ item, k }) => {
        const current = items.find((i) => i.id === item.id && i.size === item.size);
        if (current) updateQuantity(current.id, current.size, current.quantity - k);
      });
    }
  };

  const changePackSize = (pack: CartItem, newSize: string) => {
    if (newSize === pack.size) return;
    removePack(pack);
    addPack(pack, newSize);
  };

  const goToDetails = () => setStep(2);

  const title = placed ? L("Order placed", "ההזמנה התקבלה") : step === 2 ? L("Your details", "הפרטים שלכם") : L("Your bag", "הסל שלכם");

  return (
    <>
      {/* Floating cart button */}
      <button
        ref={toggleRef}
        onClick={() => setIsOpen((o) => !o)}
        data-cart-target
        aria-label={L("Open cart", "פתח סל")}
        aria-expanded={isOpen}
        className="fixed bottom-8 right-8 z-40 p-4 rounded-full shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 30px color-mix(in oklab, var(--accent) 45%, transparent)" }}
      >
        <ShoppingBag className="w-6 h-6" style={{ color: "var(--foreground)" }} />
        {count > 0 && <span className="cart-count">{count}</span>}
      </button>

      <div className={`cart-scrim ${isOpen ? "is-on" : ""}`} aria-hidden="true" />

      <aside
        ref={panelRef}
        className={`cart-drawer ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <header className="cart-head">
          <h2>
            {title}
            {!placed && count > 0 && <small>{count} {count === 1 ? L("item", "פריט") : L("items", "פריטים")}</small>}
          </h2>
          <button type="button" className="cart-icon-btn" onClick={() => setIsOpen(false)} aria-label={L("Close", "סגור")}>
            <X className="w-5 h-5" />
          </button>
        </header>

        {items.length > 0 && !placed && (
          <nav className="cart-steps" aria-label={L("Checkout steps", "שלבי הזמנה")}>
            <button type="button" onClick={() => setStep(1)} aria-current={step === 1 ? "step" : undefined} className={step > 1 ? "is-done" : ""}>
              1. {L("Bag", "סל")}
            </button>
            <button type="button" onClick={goToDetails} aria-current={step === 2 ? "step" : undefined}>
              2. {L("Details", "פרטים")}
            </button>
          </nav>
        )}

        <div className="cart-body" data-lenis-prevent>
          {/* ---------- Order placed ---------- */}
          {placed && <OrderPlaced order={placed} onDone={() => { setPlaced(null); setIsOpen(false); }} />}

          {/* ---------- Empty ---------- */}
          {!placed && items.length === 0 && (
            <div className="cart-empty">
              <p className="cart-empty-title">{L("Your bag is empty", "הסל ריק")}</p>
              <p>{L("Tap the red + on any product to add it.", "לחצו על ה-+ האדום במוצר כדי להוסיף.")}</p>
              <button type="button" className="cart-secondary" onClick={() => { setIsOpen(false); scrollToTarget("#products"); }}>
                {L("See the products", "למוצרים")}
              </button>
            </div>
          )}

          {/* ---------- Step 1: bag ---------- */}
          {step === 1 && items.length > 0 && (
            <ul className="cart-groups">
              {groups.map((g) => {
                const variant = findVariant(g.first.categoryName, g.first.productName);
                const sizes = variant?.sizes ?? [];
                const displayName = variant ? getTranslatedProductName(variant.id, language) || g.first.productName : g.first.productName;
                const groupTotal = g.packs.reduce((n, p) => n + p.price, 0);
                return (
                  <li key={g.key} className="cart-group">
                    <img src={productThumb(g.first.image)} alt="" className="cart-thumb" loading="lazy" decoding="async" />
                    <div className="min-w-0">
                      <div className="cart-group-head">
                        <span className="cart-name">{displayName}</span>
                        <span className="cart-price">₪{groupTotal}</span>
                      </div>
                      <QtyBox
                        id={`qty-${g.key}`}
                        value={g.packs.length}
                        label={L(`How many packs of ${displayName}`, `כמה חבילות ${displayName}`)}
                        lessLabel={L("One less", "אחד פחות")}
                        moreLabel={L("One more", "אחד יותר")}
                        onChange={(n) => setPackCount(g.packs, n)}
                      />
                      <ul className="cart-packs">
                        {g.packs.map((p, i) => (
                          <li key={`${p.size}-${i}`} className="cart-pack">
                            <label className="sr-only" htmlFor={`pack-${g.key}-${i}`}>{L("Size", "גודל")}</label>
                            <select
                              id={`pack-${g.key}-${i}`}
                              value={p.size}
                              onChange={(e) => changePackSize(p, e.target.value)}
                              className="cart-size"
                            >
                              {sizes.map((s) => (
                                <option key={s.size} value={s.size}>{sizeLabel(s.size, language)} · ₪{s.price}</option>
                              ))}
                            </select>
                            <button type="button" className="cart-pack-remove" onClick={() => removePack(p)} aria-label={L(`Remove ${p.size}`, `הסירו ${sizeLabel(p.size, "he")}`)}>
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* ---------- Step 2: details ---------- */}
          {step === 2 && items.length > 0 && <CheckoutFields checkout={checkout} idPrefix="cart" />}
        </div>

        {/* ---------- Footer: totals + main action ---------- */}
        {items.length > 0 && !placed && (
          <footer className="cart-foot">
            <dl className="cart-totals">
              <div><dt>{L("Subtotal", "סכום ביניים")}</dt><dd>₪{subtotal}</dd></div>
              {step === 2 && (
                <div>
                  <dt>{L("Delivery", "משלוח")}</dt>
                  <dd>{checkout.deliveryText}</dd>
                </div>
              )}
              <div className="cart-grand"><dt>{L("Total", "סה\"כ")}</dt><dd>₪{step === 2 ? checkout.total : subtotal}</dd></div>
            </dl>
            {step === 1 ? (
              <button type="button" className="cart-primary" onClick={goToDetails}>{L("Continue", "המשך")}</button>
            ) : (
              <>
                <CheckoutProblems checkout={checkout} idPrefix="cart" />
                {checkout.orderError && (
                  <p className="cart-min cart-order-error" role="alert">
                    {checkout.orderError}
                  </p>
                )}
                <button type="button" className="cart-primary" onClick={checkout.placeOrder} disabled={checkout.submitting} aria-busy={checkout.submitting}>
                  {checkout.submitting ? L("Placing your order…", "שולחים את ההזמנה…") : L("Place order", "ביצוע הזמנה")}
                </button>
                <button type="button" className="cart-link cart-back" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> {L("Back to bag", "חזרה לסל")}
                </button>
              </>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}

/* ---------- quantity box: − [number] + ---------- */
function QtyBox({ id, value, label, lessLabel, moreLabel, onChange }: {
  id: string; value: number; label: string; lessLabel: string; moreLabel: string; onChange: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isNaN(n)) setDraft(String(value));
    else if (n !== value) onChange(n);
  };
  return (
    <div className="cart-qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label={lessLabel}><Minus className="w-3.5 h-3.5" strokeWidth={3} /></button>
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label={moreLabel}><Plus className="w-3.5 h-3.5" strokeWidth={3} /></button>
    </div>
  );
}
