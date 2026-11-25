/*
 * Product info popup: compact, fits one screen without scrolling on most phones.
 * Thumbnail + name + description on top, nutrition as one row of four, then
 * ingredients and allergens as short lines. Closes on X, backdrop click or Escape.
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { lockPageScroll } from "@/lib/smoothScroll";
import { productThumb } from "@/lib/images";
import { X } from "lucide-react";
import { getWhatsAppLink } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { adultText, getTranslatedProductDescription, getCategoryNameHebrew, getTranslatedIngredients, getTranslatedAllergens, getTranslatedProductName, type ProductVariant, sizeLabel } from "@/config/products";

type ProductInfoModalProps = {
  variant: ProductVariant;
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductInfoModal({ variant, categoryName, isOpen, onClose }: ProductInfoModalProps) {
  const { language } = useLanguage();
  const t = translations.products;

  useEffect(() => {
    lockPageScroll(isOpen);
    return () => lockPageScroll(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const name = getTranslatedProductName(variant.id, language);
  const stats = [
    { label: t.protein[language], value: variant.nutrition?.protein || "50g" },
    { label: t.fat[language], value: variant.nutrition?.fat || "8g" },
    { label: t.carbs[language], value: variant.nutrition?.carbs || "2g" },
    { label: t.calories[language], value: variant.nutrition?.calories || "300" },
  ];
  const ingredients = getTranslatedIngredients(variant.id, language);
  const allergens = getTranslatedAllergens(variant.id, language);
  const adult = adultText(variant.id, language);
  const labelStyle = { color: "var(--brand-fire-bright)", letterSpacing: "0.08em" };

  // Portal to <body> so the popup sits above every card (cards create their own stacking contexts)
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 info-modal-backdrop"
      style={{ backgroundColor: "oklch(0 0 0 / 0.7)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        data-lenis-prevent className="info-modal relative w-full max-w-[36.5rem] max-h-[92vh] overflow-y-auto rounded-lg p-5 sm:p-7 space-y-5"
        style={{
          backgroundColor: "var(--background)",
          border: "1px solid color-mix(in oklab, var(--accent) 60%, transparent)",
          boxShadow: "0 30px 80px oklch(0 0 0 / 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close[language]}
          className="absolute top-4 end-4 w-10 h-10 grid place-items-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: "var(--foreground)" }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header: thumbnail + name + description */}
        <div className="flex gap-4 pe-10">
          <img
            src={productThumb(variant.image)}
            alt=""
            className="w-[6.5rem] h-[6.5rem] sm:w-[7.75rem] sm:h-[7.75rem] rounded object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[0.9rem] font-bold uppercase" style={labelStyle}>
              {language === "en" ? categoryName : getCategoryNameHebrew(categoryName)}
            </p>
            <h2
              className="leading-none mb-1.5"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.25rem", letterSpacing: "0.04em", color: "var(--foreground)" }}
            >
              {name}
            </h2>
            <p className="text-[1.1rem] leading-snug" style={{ color: "var(--brand-cream-dim)" }}>
              {getTranslatedProductDescription(variant.id, language)}
            </p>
          </div>
        </div>

        {/* Nutrition: one row of four */}
        <div>
          <p className="text-[0.9rem] font-bold uppercase mb-2" style={labelStyle}>
            {t.nutrition[language]} · {sizeLabel("100g", language)}
          </p>
          <div className="grid grid-cols-4 rounded overflow-hidden" style={{ backgroundColor: "var(--card)" }}>
            {stats.map((s, i) => (
              <div
                key={i}
                className="py-3 px-1 text-center"
                style={{ borderInlineStart: i ? "1px solid oklch(1 0 0 / 0.08)" : undefined }}
              >
                <p className="text-[1.3rem] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{s.value}</p>
                <p className="text-[0.88rem]" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.88rem] leading-snug" style={{ color: "var(--muted-foreground)" }}>
            {t.macroDisclaimer[language]}
          </p>
        </div>

        {/* Ingredients + allergens */}
        <div className="space-y-2.5 text-[1.1rem] leading-snug">
          {ingredients && (
            <p style={{ color: "var(--brand-cream-dim)" }}>
              <span className="text-[0.9rem] font-bold uppercase me-2" style={labelStyle}>{t.ingredients[language]}</span>
              {ingredients}
            </p>
          )}
          {allergens && (
            <p style={{ color: "var(--brand-cream-dim)" }}>
              <span className="text-[0.9rem] font-bold uppercase me-2" style={labelStyle}>{t.allergens[language]}</span>
              {allergens}
            </p>
          )}
          {adult && <p className="font-bold" style={{ color: "var(--foreground)" }}>{adult}</p>}
          <p style={{ color: "var(--brand-cream-dim)" }}>
            {t.allergyAsk[language]}{" "}
            <a className="info-ask" href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">{t.allergyAskLink[language]}</a>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
