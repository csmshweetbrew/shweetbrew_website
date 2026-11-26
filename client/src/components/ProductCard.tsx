/*
 * SHWEETBREW PRODUCT CARD — "Big Picture"
 * The photo leads; only name, heat and starting price sit underneath.
 * The red + on the photo slides up the sizes; one tap adds to the cart.
 * The round (i) button (top corner) opens the nutrition / ingredients popup.
 */

import { memo, useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedProductName, getCategoryNameHebrew, type ProductVariant, isAdultProduct, sizeLabel } from "@/config/products";
import { translations } from "@/config/languages";
import ProductInfoModal from "./ProductInfoModal";
import { productSrcSet, PRODUCT_CARD_SIZES } from "@/lib/images";
import { Check, Flame, Info, Plus } from "lucide-react";

interface ProductCardProps {
  variant: ProductVariant;
  categoryName: string;
  index?: number;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* A small red dot arcs from the tapped size to the floating cart button, which then bumps. */
function flyToCart(from: HTMLElement) {
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!target) return;
  const bump = () => {
    target.classList.remove("cart-bump");
    void target.offsetWidth;
    target.classList.add("cart-bump");
  };
  if (prefersReducedMotion()) return bump();

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.className = "cart-fly-dot";
  const x0 = a.left + a.width / 2 - 7, y0 = a.top + a.height / 2 - 7;
  const x1 = b.left + b.width / 2 - 7, y1 = b.top + b.height / 2 - 7;
  // A real curve in small steps (one corner in the middle looked like a bounce), eased along the way
  const cx = (x0 + x1) / 2, cy = Math.max(8, Math.min(y0, y1) - 130);
  const path: Keyframe[] = [];
  for (let i = 0; i <= 24; i++) {
    const f = i / 24, t = f < 0.5 ? 2 * f * f : 1 - 2 * (1 - f) * (1 - f);
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    path.push({ transform: `translate3d(${x}px, ${y}px, 0) scale(${1 + Math.sin(t * Math.PI) * 0.3 - t * 0.5})`, opacity: f > 0.92 ? (1 - f) / 0.08 : 1 });
  }
  // It starts where it starts and stays where it ends: Safari shows its resting place for a frame before and after
  dot.style.transform = path[0].transform as string;
  document.body.appendChild(dot);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    dot.remove();
    bump();
  };
  const anim = dot.animate(path, { duration: 700, easing: "linear", fill: "both" });
  anim.onfinish = finish;
  window.setTimeout(finish, 900); // a paused tab or a missed event: never leave it on the screen
}

const ProductCardComponent = ({ variant, categoryName, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const t = translations.products;
  const isRtl = language === "he";
  const isAvailable = variant.isAvailable !== false;
  const name = getTranslatedProductName(variant.id, language);
  const cheapest = variant.sizes[0];

  // Close the size tray on outside click or Escape
  useEffect(() => {
    if (!isTrayOpen) return;
    const onDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setIsTrayOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsTrayOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isTrayOpen]);

  const handleAdd = (size: string, price: number, el: HTMLElement) => {
    addItem({
      id: `${categoryName}-${variant.name}-${size}`,
      categoryName,
      productName: variant.name,
      size,
      price,
      quantity: 1,
      image: variant.image,
    });
    window.dispatchEvent(new CustomEvent("cartAdded", { detail: { product: variant.name, size, price } }));
    flyToCart(el);
    setIsTrayOpen(false);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1300);
  };

  const heatLevel = variant.spiceLevel <= 1 ? 0 : Math.min(variant.spiceLevel - 1, 3);

  return (
    <>
      <article
        ref={cardRef}
        className={`product-card ${isTrayOpen ? "is-open" : ""}`}
        style={{ ["--i" as string]: index }}
      >
        <div className="product-shot">
          <img
            src={variant.image}
            srcSet={productSrcSet(variant.image)}
            sizes={PRODUCT_CARD_SIZES}
            width={720}
            height={900}
            alt={`${categoryName} – ${name}`}
            loading="lazy"
            decoding="async"
            className={isAvailable ? "" : "is-unavailable"}
          />

          {/* (i) → nutrition, ingredients, full description */}
          <button
            type="button"
            className={`product-info-btn ${isRtl ? "left-2.5" : "right-2.5"}`}
            onClick={() => setIsInfoOpen(true)}
            aria-label={`${t.info[language]}: ${name}`}
          >
            <Info className="w-4 h-4" aria-hidden="true" />
          </button>

          {isAdultProduct(variant.id) && <span className={`product-adult ${isRtl ? "right-2.5" : "left-2.5"}`}><bdi dir="ltr">18+</bdi></span>}

          {!isAvailable && (
            <span className="product-unavailable" title={variant.unavailableReason}>
              {t.notAvailable[language]}
            </span>
          )}

          {/* Size tray */}
          <div className="product-tray" aria-hidden={!isTrayOpen} id={`sizes-${variant.id}`}>
            <span className="product-tray-label">{t.pickSize[language]}</span>
            <div className="grid grid-cols-2 gap-1.5">
              {variant.sizes.map((s) => {
                const soldOut = s.stock === 0;
                return (
                  <button
                    key={s.size}
                    type="button"
                    className="size-chip"
                    tabIndex={isTrayOpen ? 0 : -1}
                    disabled={soldOut}
                    onClick={(e) => handleAdd(s.size, s.price, e.currentTarget)}
                  >
                    <span>{sizeLabel(s.size, language)}</span>
                    <span>{soldOut ? (language === "he" ? "אזל" : "Sold out") : `₪${s.price}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isAvailable && (
            <button
              type="button"
              className={`product-plus ${isRtl ? "left-2.5" : "right-2.5"} ${justAdded ? "is-done" : ""}`}
              onClick={() => setIsTrayOpen((o) => !o)}
              aria-expanded={isTrayOpen}
              aria-controls={`sizes-${variant.id}`}
              aria-label={`${justAdded ? t.added[language] : t.addProduct[language]} ${name}`}
            >
              {justAdded ? <Check className="w-5 h-5" strokeWidth={3} /> : <Plus className="w-5 h-5 product-plus-icon" strokeWidth={3} />}
            </button>
          )}
        </div>

        <div className="product-text">
          <h3 className="product-name">{name}</h3>
          {/* What kind of product this is, so "Traditional" reads as "Traditional · Biltong" */}
          <p className="product-category">{language === "he" ? getCategoryNameHebrew(categoryName.toUpperCase()) : categoryName}</p>
          <div className="product-meta">
            {heatLevel === 0 ? (
              <span className="product-mild">{t.spiceMild[language]}</span>
            ) : (
              <span className="flex" aria-label={`${t.spiceLevel[language]} ${heatLevel}/3`}>
                {Array.from({ length: heatLevel }).map((_, i) => (
                  <Flame key={i} className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} style={{ color: "var(--accent)" }} aria-hidden="true" />
                ))}
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span>
              {t.priceFrom[language]} <span className="product-price">₪{cheapest.price}</span>
              <span className="product-unit"> / {sizeLabel(cheapest.size, language)}</span>
            </span>
          </div>
        </div>
      </article>

      <ProductInfoModal
        variant={variant}
        categoryName={categoryName}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </>
  );
};

export default memo(ProductCardComponent);
