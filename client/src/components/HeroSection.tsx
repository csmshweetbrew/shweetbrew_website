/*
 * SHWEETBREW HERO SECTION
 * Design: Full-bleed dark braai fire background, bold Bebas Neue headline
 * Israeli flag colours in headline, fire orange CTA
 * Diagonal clip-path bottom edge for section transition
 */

import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { getWhatsAppLink } from "@/config/site";

const WHATSAPP_URL = getWhatsAppLink("Hi Shweet Brew! I'd like to place an order 🥩");

const HERO_IMAGE = "/manus-storage/shweetbrew-hero_e80e905e.jpg";

export default function HeroSection() {
  const { language } = useLanguage();
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    const timer = setTimeout(() => {
      el.style.transition = "opacity 0.9s ease-out, transform 0.9s ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "oklch(0.10 0.005 60)" }}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663491314336/GHvX6FS9zEwj9cBKkXQgeg/hero-bg-subtle-LxfzDrKkZY4bEMHcpHWW5T.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />

      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, oklch(0.10 0.005 60 / 0.55) 0%, oklch(0.10 0.005 60 / 0.75) 60%, oklch(0.10 0.005 60 / 0.95) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container text-center pt-24 pb-32">
        <div ref={headlineRef}>
          {/* Badges row */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            <span
              className="stamp-badge text-xs md:text-sm"
              style={{ color: "oklch(0.50 0.18 260)", borderColor: "oklch(0.50 0.18 260)" }}
            >
              {translations.hero.madeInIsrael[language]}
            </span>
            <span
              className="stamp-badge text-xs md:text-sm"
              style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
            >
              {translations.hero.saRoots[language]}
            </span>
            <span
              className="stamp-badge text-xs md:text-sm"
              style={{ color: "oklch(0.75 0.15 75)", borderColor: "oklch(0.75 0.15 75)" }}
            >
              {translations.hero.kosherOptions[language]}
            </span>

          </div>

          {/* Main headline */}
          <h1
            className="font-display leading-none mb-4"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3.5rem, 10vw, 9rem)",
              textShadow: "0 4px 30px oklch(0 0 0 / 0.8)",
              letterSpacing: "0.04em",
            }}
          >
            <span style={{ color: "var(--accent)" }}>{translations.hero.title1Word1[language]}</span>{" "}
            <span style={{ color: "oklch(0.94 0.025 75)" }}>{translations.hero.title1Word2[language]}</span>
            <br />
            <span style={{ color: "oklch(0.50 0.18 260)" }}>{translations.hero.title2Word1[language]}</span>{" "}
            <span style={{ color: "oklch(0.94 0.025 75)" }}>{translations.hero.title2Word2[language]}</span>
          </h1>

          {/* Brand name */}
          <div
            className="font-display mb-6"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              color: "var(--accent)",
              letterSpacing: "0.3em",
              textShadow: "0 0 30px oklch(0.62 0.20 42 / 0.5)",
            }}
          >
            SHWEET BREW
          </div>

          {/* Subheadline */}
          <p
            className="font-body max-w-3xl mx-auto mb-10 leading-relaxed px-2"
            style={{ color: "oklch(0.80 0.020 75)" }}
          >
            <div style={{ fontSize: "clamp(0.875rem, 5vw, 1.5rem)", lineHeight: "1.3", marginBottom: "0.5rem" }}>Authentic South African <span style={{ color: "var(--accent)", fontWeight: 700 }}>Biltong and Boerewors</span>.</div>
            <div style={{ fontSize: "clamp(0.875rem, 5vw, 1.5rem)", lineHeight: "1.3", marginBottom: "0.5rem" }}>Mouthwatering American <span style={{ color: "var(--accent)", fontWeight: 700 }}>Jerky</span>.</div>
            <div className="h-4"></div>
            <div style={{ fontSize: "clamp(0.875rem, 4vw, 1.25rem)", lineHeight: "1.3", marginBottom: "0.25rem" }}>And more — crafted with <span style={{ color: "oklch(0.50 0.18 260)", fontWeight: 700 }}>Israeli pride</span> and <span style={{ color: "oklch(0.50 0.18 260)", fontWeight: 700 }}>SA soul</span>.</div>
            <div style={{ fontSize: "clamp(0.875rem, 4vw, 1.25rem)", lineHeight: "1.3" }}>{translations.hero.taglineEnd[language]}</div>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded font-body font-bold text-lg tracking-wide transition-all hover:scale-105 whatsapp-pulse"
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
                boxShadow: "0 0 30px rgba(37,211,102,0.4), 0 4px 20px rgba(0,0,0,0.4)",
                minWidth: "220px",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {translations.hero.orderOnWhatsApp[language]}
            </a>

            <button
              onClick={() => {
                const el = document.querySelector("#products");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 px-8 py-4 rounded font-body font-bold text-lg tracking-wide transition-all hover:scale-105 border-2"
              style={{
                backgroundColor: "transparent",
                color: "oklch(0.94 0.025 75)",
                borderColor: "oklch(0.94 0.025 75 / 0.5)",
                minWidth: "220px",
                justifyContent: "center",
              }}
            >
              {translations.hero.browseProducts[language]}
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { num: "7+", label: translations.hero.products[language] },
              { num: "100%", label: translations.hero.beef[language] },
              { num: "🇮🇱", label: translations.hero.israelWideDelivery[language] },
              { num: "SA", label: translations.hero.authenticRecipes[language] },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-display text-3xl md:text-4xl"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", color: "var(--accent)" }}
                >
                  {stat.num}
                </div>
                <div
                  className="font-body text-xs tracking-widest uppercase mt-1"
                  style={{ color: "oklch(0.65 0.015 75)", letterSpacing: "0.15em" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagonal bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "oklch(0.13 0.005 60)",
          clipPath: "polygon(0 60%, 100% 0, 100% 100%, 0 100%)",
        }}
      />


    </section>
  );
}
