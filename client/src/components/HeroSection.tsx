/*
 * SHWEETBREW HERO — "Four ranges" quick-shop landing
 *
 * Goal: within a second a visitor knows what we sell, and can jump straight to it.
 *  1. Headline + one sentence saying exactly what the shop sells.
 *  2. Four big photo tiles, one per range (Biltong, Jerky, Boerewors, Sauces & Shots),
 *     each with its starting price. A tap opens the products section on that range.
 *  3. Shop all products / Contact us (scrolls to the contact section).
 *  4. Trust row: Made in Israel · SA roots · Kosher ingredients, not certified.
 */

import { ArrowRight, MessageCircle, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import type { ProductCategory } from "@/config/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { productSrcSet } from "@/lib/images";
import { FILTER_GROUPS, openShop } from "@/lib/shopFilter";
import { scrollToTarget } from "@/lib/smoothScroll";
import { FlagIsrael, FlagSouthAfrica, KosherStar } from "./Flags";
import { sizeLabel } from "@/config/products";


type Range = {
  filter: string;
  name: { en: string; he: string };
  line: { en: string; he: string };
  color: string;
  imageFrom: string; // category id whose photo the tile uses
};

const RANGES: Range[] = [
  { filter: "biltong", name: { en: "Biltong", he: "בילטונג" }, line: { en: "Air-dried SA beef", he: "בקר מיובש בסגנון דרום אפריקאי" }, color: "var(--brand-israeli-blue-light)", imageFrom: "biltong" },
  { filter: "HOLY LAND JERKY", name: { en: "Jerky", he: "ג'רקי" }, line: { en: "Beef & chicken jerky", he: "ג'רקי בקר ועוף" }, color: "var(--accent)", imageFrom: "HOLY LAND JERKY" },
  { filter: "wors", name: { en: "Boerewors", he: "בוארווורס" }, line: { en: "Fresh wors & drywors", he: "בוארווורס טרי ודרייוורס" }, color: "var(--brand-gold)", imageFrom: "boerewors" },
  { filter: "extras", name: { en: "Sauces & Shots", he: "רטבים ושוטס" }, line: { en: "Sweet chilli & shots", he: "צ'ילי מתוק ושוטס" }, color: "oklch(0.70 0.18 50)", imageFrom: "sauces" },
];

/** Lowest price across the categories a filter covers, with its size */
function startingPrice(products: ProductCategory[], filter: string): { price: number; size: string } | null {
  const ids = FILTER_GROUPS[filter] ?? [filter];
  let best: { price: number; size: string } | null = null;
  for (const cat of products.filter((c) => ids.includes(c.id))) {
    for (const v of cat.variants) {
      if (v.isAvailable === false) continue;
      for (const s of v.sizes) {
        if (s.stock === 0) continue;
        if (!best || s.price < best.price) best = { price: s.price, size: s.size };
      }
    }
  }
  return best;
}

export default function HeroSection() {
  const { language } = useLanguage();
  const { categories: products } = useCatalog();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);

  return (
    <section id="hero" className="hero-shop relative overflow-hidden">
      {/* Background photo + warm darkening, fading out into the fire background */}
      <div className="hero-backdrop">
      <img
        src="/images/hero-1280.webp"
        srcSet="/images/hero-960.webp 960w, /images/hero-1280.webp 1280w"
        sizes="100vw"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="hero-photo absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, oklch(0.10 0.02 40 / 0.45) 0%, oklch(0.08 0.01 50 / 0.82) 100%), linear-gradient(to bottom, oklch(0.08 0.01 50 / 0.35) 0%, oklch(0.08 0.01 50 / 0.6) 50%, oklch(0.13 0.005 60) 100%)",
        }}
      />
      </div>

      <div className="relative z-10 container hero-shop-inner">
        {/* 1. What this is */}
        {/* The slogan stays in English on the Hebrew site too (Caleb, 2026-11-26) */}
        <h1 className="hero-shop-title" lang="en" dir="ltr" data-reveal="heading" style={{ ["--reveal-delay" as string]: "60ms" }}>
          <span style={{ color: "var(--accent)" }}>{translations.hero.title1Word1.en}</span>{" "}
          {translations.hero.title1Word2.en}
          <br />
          <span style={{ color: "var(--brand-israeli-blue-light)" }}>{translations.hero.title2Word1.en}</span>{" "}
          {translations.hero.title2Word2.en}
        </h1>
        <p className="hero-shop-what" data-reveal="text" style={{ ["--reveal-delay" as string]: "160ms" }}>
          {/* Product words highlighted in their range tile colours (biltong blue, boerewors gold, jerky red) */}
          {he ? (
            <strong className="block">
              <span className="hero-word is-biltong">בילטונג</span> ו<span className="hero-word is-wors">בוארווורס</span> דרום אפריקאיים ו<span className="hero-word is-jerky">ג'רקי</span> בסגנון אמריקאי.
            </strong>
          ) : (
            <strong className="block">
              South African <span className="hero-word is-biltong">biltong</span>, <span className="hero-word is-wors">boerewors</span> and American{"\u2011"}style <span className="hero-word is-jerky">jerky</span>.
            </strong>
          )}
          <span className="block">{L("Made in Modiin and delivered across Israel.", "מיוצרים במודיעין ונשלחים לכל הארץ.")}</span>
        </p>

        {/* 2. Four ranges */}
        <div className="hero-ranges">
          {RANGES.map((r, i) => {
            const img = products.find((c) => c.id === r.imageFrom)?.image;
            const from = startingPrice(products, r.filter);
            return (
              <button key={r.filter} type="button" className="hero-range" onClick={() => openShop(r.filter)} data-reveal="zoom" style={{ ["--reveal-delay" as string]: `${260 + i * 80}ms` }}>
                <span className="hero-range-bar" style={{ backgroundColor: r.color }} />
                {img && <img src={img} srcSet={productSrcSet(img)} sizes="(min-width: 768px) 260px, 46vw" alt="" loading="eager" decoding="async" />}
                <span className="hero-range-go" style={{ backgroundColor: r.color }}>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" strokeWidth={2.6} aria-hidden="true" />
                </span>
                <span className="hero-range-name">{r.name[language]}</span>
                <span className="hero-range-line">
                  {r.line[language]}
                  {from && <> · {L("from", "החל מ-")} <strong>₪{from.price}</strong> / {sizeLabel(from.size, language)}</>}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Main actions */}
        <div className="hero-actions" data-reveal="" style={{ ["--reveal-delay" as string]: "600ms" }}>
          <button type="button" className="hero-btn hero-btn-red" onClick={() => openShop("all")}>
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {L("Shop all products", "לכל המוצרים")}
          </button>
          <button type="button" className="hero-btn hero-btn-green" onClick={() => scrollToTarget("#contact")}>
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            {L("Contact us", "צרו קשר")}
          </button>
        </div>

        {/* 4. Trust row */}
        <ul className="hero-trust" data-reveal="fade" style={{ ["--reveal-delay" as string]: "720ms" }}>
          <li><FlagIsrael className="hero-flag" /><span>{L("Made in Israel", "תוצרת הארץ")}</span></li>
          <li><FlagSouthAfrica className="hero-flag" /><span>{L("SA roots", "שורשים דרום אפריקאיים")}</span></li>
          <li><KosherStar className="hero-star" /><span>{L("Kosher ingredients, not certified", "רכיבים כשרים, ללא תעודה")}</span></li>
        </ul>

      </div>
    </section>
  );
}
