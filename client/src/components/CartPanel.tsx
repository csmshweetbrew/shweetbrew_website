/*
 * SHWEETBREW CART — two-step drawer
 *
 * Step 1 "Bag": one block per product. Every pack is its own small row with its
 * own size, so 1.5kg can be 1kg + 500g instead of 500g x3. The + on a product
 * adds another row (same size as the last one); each row can change size or be
 * removed.
 * Step 2 "Details": a searchable delivery-area picker (type a town or area),
 * name, phone, address and an optional note.
 * Step 3: order placed (placeholder — see lib/orders.ts).
 *
 * Closes on the X, a click outside, or Escape.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingBag, X, Plus, Minus, ChevronLeft, ChevronDown, Search, Check } from "lucide-react";
import { getTranslatedProductName } from "@/config/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { findVariant as findCatalogVariant, findVariantById } from "@/lib/catalog";
import { deliveryZones, getNextDeliveryDate, formatDeliveryDate, zoneName, zoneDays, zoneNameBoth, zoneSearchTerms, type DeliveryZone } from "@/config/deliveryZones";
import { makeReference, submitOrder, orderWhatsAppLink, type Order, type OrderError } from "@/lib/orders";
import { productThumb } from "@/lib/images";
import { scrollToTarget, lockPageScroll } from "@/lib/smoothScroll";

const MIN_DELIVERY_ORDER = 80;
const OTHER_ZONE = "zone_everywhere_else";

type Step = 1 | 2 | 3;

export default function CartPanel() {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const {
    items, addItem, updateQuantity, subtotal, selectedArea, setSelectedArea,
    clearCart, name, setName, phone, setPhone, notes, setNotes,
    shippingDetails: address, setShippingDetails: setAddress,
  } = useCart();

  const { categories, refresh: refreshCatalog } = useCatalog();
  const findVariant = (categoryName: string, productName: string) => findCatalogVariant(categories, categoryName, productName);

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<{ error: OrderError; order: Order } | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [tried, setTried] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [city, setCity] = useState("");
  const [apartment, setApartment] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const zone = deliveryZones.find((z) => z.id === selectedArea);
  const feeKnown = zone ? zone.price >= 0 : false;
  const deliveryFee = zone && zone.price > 0 ? zone.price : 0;
  const total = subtotal + deliveryFee;
  const belowMinimum = !!zone && zone.id !== "modiin" && subtotal < MIN_DELIVERY_ORDER;
  const errors = {
    zone: !zone ? L("Choose where it's going.", "בחרו לאן לשלוח.") : "",
    name: !name.trim() ? L("Add your name.", "הוסיפו שם.") : "",
    phone: !/^[0-9+\-\s()]{9,}$/.test(phone.trim()) ? L("Add a phone number we can reach.", "הוסיפו מספר טלפון.") : "",
  };
  const hasErrors = !!(errors.zone || errors.name || errors.phone);

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

  // Freeze the page behind the open drawer
  useEffect(() => {
    lockPageScroll(isOpen);
    return () => lockPageScroll(false);
  }, [isOpen]);

  // Back to the bag when it empties; leave the "placed" screen once the drawer closes
  useEffect(() => {
    if (!items.length && step === 2) setStep(1);
  }, [items.length, step]);
  useEffect(() => {
    if (!isOpen && step === 3) {
      setStep(1);
      setPlaced(null);
    }
  }, [isOpen, step]);

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

  // A changed bag or area makes an old order error stale
  useEffect(() => setOrderError(null), [items, selectedArea]);

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

  // Same logic as the Order section (OrderForm.tsx): only once an area is chosen
  const nextDeliveryDate = zone ? getNextDeliveryDate(zone) : null;

  /** What went wrong with the order, in the visitor's language */
  const orderErrorText = (err: OrderError): string => {
    const item = "productId" in err ? findVariantById(categories, err.productId) : null;
    const what = item ? `${getTranslatedProductName(item.variant.id, language) || item.variant.name} ${err.code === "OUT_OF_STOCK" || err.code === "UNAVAILABLE" ? err.size : ""}`.trim() : "";
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
      case "TOO_MANY_ORDERS":
        return L("You've just placed a few orders. Message us on WhatsApp if you need to change one.", "ביצעתם כמה הזמנות ממש עכשיו. כתבו לנו בוואטסאפ אם צריך לשנות משהו.");
      default:
        return L("We couldn't send your order. Try again, or send it to us on WhatsApp.", "לא הצלחנו לשלוח את ההזמנה. נסו שוב, או שלחו לנו אותה בוואטסאפ.");
    }
  };

  const placeOrder = async () => {
    if (submitting) return;
    if (hasErrors || belowMinimum) {
      setTried(true);
      requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    const order: Order = {
      reference: makeReference(),
      name: name.trim(),
      phone: phone.trim(),
      address: [address.trim(), apartment.trim(), city.trim()].filter(Boolean).join(", "),
      city: city.trim(),
      street: address.trim(),
      apartment: apartment.trim(),
      zoneId: zone!.id,
      zoneName: zone!.name,
      notes: notes.trim(),
      language: he ? "he" : "en",
      requestedDeliveryDate: nextDeliveryDate && zone!.id !== OTHER_ZONE ? toIsoDate(nextDeliveryDate) : undefined,
      lines: items.map((i) => ({
        productId: findVariant(i.categoryName, i.productName)?.id,
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
      setOrderError({ error: result.error, order });
      if (result.error.code === "OUT_OF_STOCK" || result.error.code === "UNAVAILABLE") void refreshCatalog();
      return;
    }
    setPlaced(result.order);
    setStep(3);
    setTried(false);
    clearCart();
    setCity("");
    setApartment("");
  };

  const title = step === 3 ? L("Order placed", "ההזמנה התקבלה") : step === 2 ? L("Your details", "הפרטים שלכם") : L("Your bag", "הסל שלכם");

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
            {step !== 3 && count > 0 && <small>{count} {count === 1 ? L("item", "פריט") : L("items", "פריטים")}</small>}
          </h2>
          <button type="button" className="cart-icon-btn" onClick={() => setIsOpen(false)} aria-label={L("Close", "סגור")}>
            <X className="w-5 h-5" />
          </button>
        </header>

        {items.length > 0 && step !== 3 && (
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
          {/* ---------- Step 3: placed ---------- */}
          {step === 3 && placed && (
            <div className="cart-placed">
              <span className="cart-placed-mark"><Check className="w-7 h-7" strokeWidth={3} /></span>
              <p className="cart-placed-ref">{placed.reference}</p>
              <p>
                {L(
                  `Thanks ${placed.name.split(" ")[0]}. We'll call or message ${placed.phone} to confirm the delivery time and payment.`,
                  `תודה ${placed.name.split(" ")[0]}. ניצור קשר במספר ${placed.phone} כדי לאשר זמן משלוח ותשלום.`
                )}
              </p>
              <p className="cart-placed-total">{L("Total", "סה\"כ")} ₪{placed.total}</p>
              <button type="button" className="cart-secondary" onClick={() => setIsOpen(false)}>
                {L("Back to the shop", "חזרה לחנות")}
              </button>
            </div>
          )}

          {/* ---------- Empty ---------- */}
          {step !== 3 && items.length === 0 && (
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
                                <option key={s.size} value={s.size}>{s.size} · ₪{s.price}</option>
                              ))}
                            </select>
                            <button type="button" className="cart-pack-remove" onClick={() => removePack(p)} aria-label={L(`Remove ${p.size}`, `הסר ${p.size}`)}>
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
          {step === 2 && items.length > 0 && (
            <div className="cart-form">
              <AreaPicker
                language={language}
                value={selectedArea}
                onChange={setSelectedArea}
                error={tried ? errors.zone : ""}
              />
              {zone && nextDeliveryDate && zone.id !== OTHER_ZONE && (
                <p className="cart-next-delivery">
                  {L("Next available delivery: ", "משלוח זמין הבא: ")}
                  <strong>{formatDeliveryDate(nextDeliveryDate, language)}</strong>
                </p>
              )}
              {zone && zone.id === OTHER_ZONE && (
                <p className="cart-next-delivery">
                  {L("Delivery by arrangement - Contact us for pricing and delivery dates", "משלוח לפי הסכמה - צור איתנו קשר לתמחור ותאריכי משלוח")}
                </p>
              )}
              {belowMinimum && (
                <p className="cart-min" role="status">
                  {L(
                    `Delivery starts at ₪${MIN_DELIVERY_ORDER}. Add ₪${MIN_DELIVERY_ORDER - subtotal} more, or choose Modiin for pickup.`,
                    `משלוח מ-₪${MIN_DELIVERY_ORDER}. הוסיפו עוד ₪${MIN_DELIVERY_ORDER - subtotal}, או בחרו איסוף במודיעין.`
                  )}
                </p>
              )}
              <div className="cart-row2">
                <Field id="cart-name" label={L("Name", "שם")} value={name} onChange={setName} error={tried ? errors.name : ""} autoComplete="name" />
                <Field id="cart-phone" label={L("Phone", "טלפון")} value={phone} onChange={setPhone} error={tried ? errors.phone : ""} type="tel" autoComplete="tel" />
              </div>
              <fieldset className="cart-address">
                <legend>
                  {L("Delivery address", "כתובת למשלוח")}
                  {zone?.id === "modiin" && <span className="cart-optional"> {L("(leave empty for pickup)", "(השאירו ריק לאיסוף)")}</span>}
                </legend>
                <div className="cart-row2">
                  <Field id="cart-city" label={L("City", "עיר")} value={city} onChange={setCity} autoComplete="address-level2" />
                  <Field id="cart-street" label={L("Street and number", "רחוב ומספר")} value={address} onChange={setAddress} autoComplete="address-line1" />
                </div>
                <Field id="cart-apartment" label={L("Apartment, floor, entrance (optional)", "דירה, קומה, כניסה (לא חובה)")} value={apartment} onChange={setApartment} autoComplete="address-line2" />
              </fieldset>
              <div className="cart-field">
                <label htmlFor="cart-notes">{L("Note", "הערה")} <span className="cart-optional">{L("(optional)", "(לא חובה)")}</span></label>
                <textarea id="cart-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={L("Gate code, a time that suits you, a gift message…", "קוד שער, שעה נוחה, הקדשה…")} />
              </div>
            </div>
          )}
        </div>

        {/* ---------- Footer: totals + main action ---------- */}
        {items.length > 0 && step !== 3 && (
          <footer className="cart-foot">
            <dl className="cart-totals">
              <div><dt>{L("Subtotal", "סכום ביניים")}</dt><dd>₪{subtotal}</dd></div>
              {step === 2 && (
                <div>
                  <dt>{L("Delivery", "משלוח")}</dt>
                  <dd>{!zone ? "—" : zone.price === 0 ? L("Free", "חינם") : zone.price < 0 ? L("To arrange", "בתיאום") : `₪${zone.price}`}</dd>
                </div>
              )}
              <div className="cart-grand"><dt>{L("Total", "סה\"כ")}</dt><dd>₪{step === 2 ? total : subtotal}</dd></div>
            </dl>
            {step === 1 ? (
              <button type="button" className="cart-primary" onClick={goToDetails}>{L("Continue", "המשך")}</button>
            ) : (
              <>
                {orderError && (
                  <p className="cart-min cart-order-error" role="alert">
                    {orderErrorText(orderError.error)}
                    {orderError.error.code === "NETWORK" && (
                      <>
                        {" "}
                        <a className="cart-link" href={orderWhatsAppLink(orderError.order)} target="_blank" rel="noopener noreferrer">
                          {L("Send it on WhatsApp", "שליחה בוואטסאפ")}
                        </a>
                      </>
                    )}
                  </p>
                )}
                <button type="button" className="cart-primary" onClick={placeOrder} disabled={submitting} aria-busy={submitting}>
                  {submitting ? L("Placing your order…", "שולחים את ההזמנה…") : L("Place order", "ביצוע הזמנה")}
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

/* ---------- small field ---------- */
function Field({ id, label, value, onChange, error, type = "text", autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; autoComplete?: string;
}) {
  return (
    <div className="cart-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && <span id={`${id}-err`} className="cart-err">{error}</span>}
    </div>
  );
}

/* ---------- searchable delivery-area picker ---------- */
function AreaPicker({ language, value, onChange, error }: {
  language: string; value: string; onChange: (id: string) => void; error?: string;
}) {
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const selected = deliveryZones.find((z) => z.id === value);

  const lang = he ? "he" : "en";
  const label = (z: DeliveryZone) => (z.id === OTHER_ZONE ? L("Somewhere else", "מקום אחר") : zoneName(z, lang));
  const days = (z: DeliveryZone) => zoneDays(z, lang) || L("We'll arrange a day with you", "נתאם יום איתכם");
  const fee = (z: DeliveryZone) => (z.price === 0 ? L("Free", "חינם") : z.price < 0 ? L("To arrange", "בתיאום") : `₪${z.price}`);

  // Ignore case, spaces and punctuation so "raanana" finds "Ra'anana" and "telaviv" finds "Tel Aviv"
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9֐-׿]/g, "");
  const q = norm(query);
  const results = deliveryZones
    .map((z) => {
      // search both the English and the Hebrew names; show the town in the visitor's language
      const term = q ? zoneSearchTerms(z).find((t) => norm(t.en).includes(q) || norm(t.he).includes(q)) : undefined;
      const town = term ? (he ? term.he : term.en) : undefined;
      const hit = !q || zoneNameBoth(z).some((n) => n && norm(n).includes(q)) || !!term || z.id === OTHER_ZONE;
      return hit ? { zone: z, town } : null;
    })
    .filter(Boolean) as { zone: DeliveryZone; town?: string }[];
  const showList = open;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !e.composedPath().includes(boxRef.current)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  const choose = (id: string) => {
    onChange(id);
    setQuery("");
    setOpen(false);
  };

  if (selected && !open) {
    return (
      <div className="cart-field">
        <span className="cart-label">{L("Delivery area", "אזור משלוח")}</span>
        <div className="cart-area-chosen">
          <span className="min-w-0">
            <strong>{label(selected)}</strong>
            <span>{days(selected)}</span>
          </span>
          <span className="cart-area-fee">{fee(selected)}</span>
          <button type="button" className="cart-link" onClick={() => { onChange(""); setQuery(""); setOpen(true); setActive(0); }}>{L("Change", "שינוי")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-field" ref={boxRef}>
      <label htmlFor="cart-area">{L("Delivery area", "אזור משלוח")}</label>
      <div className="cart-search">
        <Search className="w-4 h-4" aria-hidden="true" />
        <input
          id="cart-area"
          role="combobox"
          aria-expanded={showList}
          aria-controls="cart-area-list"
          aria-activedescendant={showList && results[active] ? `area-${results[active].zone.id}` : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "cart-area-err" : undefined}
          autoComplete="off"
          placeholder={L("Type your town, e.g. Ra'anana", "הקלידו עיר, למשל רעננה")}
          value={query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && showList && results[active]) { e.preventDefault(); choose(results[active].zone.id); }
            else if (e.key === "Escape" && showList) { e.preventDefault(); setOpen(false); }
          }}
        />
        <ChevronDown className={`cart-search-caret w-4 h-4 ${showList ? "rotate-180" : ""}`} aria-hidden="true" />
      </div>
      {showList && (
        <ul id="cart-area-list" role="listbox" className="cart-area-list" data-lenis-prevent>
          {results.map(({ zone: z, town }, i) => (
            <li
              key={z.id}
              id={`area-${z.id}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : ""}
              onPointerDown={(e) => { e.preventDefault(); choose(z.id); }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="min-w-0">
                <strong>{label(z)}</strong>
                <span>{town ? town : days(z)}</span>
              </span>
              <span className="cart-area-fee">{fee(z)}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <span id="cart-area-err" className="cart-err">{error}</span>}
    </div>
  );
}

/** yyyy-mm-dd in local time (what the delivery-date picker showed) */
function toIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
