/*
 * The checkout details form, shared by the cart drawer and the Order section:
 * confirmed email, searchable delivery area (+ next delivery date), the minimum
 * note, name + phone, address and an optional note.
 *
 * `idPrefix` keeps field ids unique, since both copies can be on the page at once.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { deliveryZones, formatDeliveryDate, zoneDays, zoneName, zoneNameBoth, zoneSearchTerms, type DeliveryZone } from "@/config/deliveryZones";
import CheckoutEmail from "../CheckoutEmail";
import { MIN_DELIVERY_ORDER, OTHER_ZONE, type Checkout } from "./useCheckout";

export default function CheckoutFields({ checkout, idPrefix }: { checkout: Checkout; idPrefix: string }) {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const {
    selectedArea, setSelectedArea, name, setName, phone, setPhone, notes, setNotes,
    shippingDetails: street, setShippingDetails: setStreet, city, setCity, apartment, setApartment,
  } = useCart();
  const { zone, nextDeliveryDate, belowMinimum, subtotal, errors, tried } = checkout;
  const id = (s: string) => `${idPrefix}-${s}`;

  return (
    <div className="cart-form">
      <CheckoutEmail idPrefix={idPrefix} error={tried ? errors.email : ""} />
      <AreaPicker idPrefix={idPrefix} language={language} value={selectedArea} onChange={setSelectedArea} error={tried ? errors.zone : ""} />
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
        <Field id={id("name")} label={L("Name", "שם")} value={name} onChange={setName} error={tried ? errors.name : ""} autoComplete="name" />
        <Field id={id("phone")} label={L("Phone", "טלפון")} value={phone} onChange={setPhone} error={tried ? errors.phone : ""} type="tel" autoComplete="tel" />
      </div>
      <fieldset className="cart-address">
        <legend>
          {L("Delivery address", "כתובת למשלוח")}
          {zone?.id === "modiin" && <span className="cart-optional"> {L("(leave empty for pickup)", "(השאירו ריק לאיסוף)")}</span>}
        </legend>
        <div className="cart-row2">
          <Field id={id("city")} label={L("City", "עיר")} value={city} onChange={setCity} autoComplete="address-level2" />
          <Field id={id("street")} label={L("Street and number", "רחוב ומספר")} value={street} onChange={setStreet} autoComplete="address-line1" />
        </div>
        <Field id={id("apartment")} label={L("Apartment, floor, entrance (optional)", "דירה, קומה, כניסה (לא חובה)")} value={apartment} onChange={setApartment} autoComplete="address-line2" />
      </fieldset>
      {checkout.signedIn && (
        <label className="checkout-save" htmlFor={id("save")}>
          <input id={id("save")} type="checkbox" checked={checkout.saveDetails} onChange={(e) => checkout.setSaveDetails(e.target.checked)} />
          <span className="checkout-save-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
          </span>
          <span>{L("Save these details for next time", "שמרו את הפרטים לפעם הבאה")}</span>
        </label>
      )}
      <div className="cart-field">
        <label htmlFor={id("notes")}>{L("Note", "הערה")} <span className="cart-optional">{L("(optional)", "(לא חובה)")}</span></label>
        <textarea id={id("notes")} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={L("Gate code, a time that suits you, a gift message…", "קוד שער, שעה נוחה, הקדשה…")} />
      </div>
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
function AreaPicker({ idPrefix, language, value, onChange, error }: {
  idPrefix: string; language: string; value: string; onChange: (id: string) => void; error?: string;
}) {
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const selected = deliveryZones.find((z) => z.id === value);
  const inputId = `${idPrefix}-area`;

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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !e.composedPath().includes(boxRef.current)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  const choose = (zoneId: string) => {
    onChange(zoneId);
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
      <label htmlFor={inputId}>{L("Delivery area", "אזור משלוח")}</label>
      <div className="cart-search">
        <Search className="w-4 h-4" aria-hidden="true" />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${inputId}-list`}
          aria-activedescendant={open && results[active] ? `${inputId}-${results[active].zone.id}` : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-err` : undefined}
          autoComplete="off"
          placeholder={L("Type your town, e.g. Ra'anana", "הקלידו עיר, למשל רעננה")}
          value={query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && open && results[active]) { e.preventDefault(); choose(results[active].zone.id); }
            else if (e.key === "Escape" && open) { e.preventDefault(); setOpen(false); }
          }}
        />
        <ChevronDown className={`cart-search-caret w-4 h-4 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </div>
      {open && (
        <ul id={`${inputId}-list`} role="listbox" className="cart-area-list" data-lenis-prevent>
          {results.map(({ zone: z, town }, i) => (
            <li
              key={z.id}
              id={`${inputId}-${z.id}`}
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
      {error && <span id={`${inputId}-err`} className="cart-err">{error}</span>}
    </div>
  );
}
