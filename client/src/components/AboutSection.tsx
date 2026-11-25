/*
 * SHWEETBREW ABOUT SECTION - PRIORITY SECTION
 * Full story of South African roots and Israeli pride
 * Design: Large, immersive layout with full story, values, and mission
 * Warm, personal storytelling tone with Zionistic pride
 */

import { SITE_CONFIG } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { createPortal } from "react-dom";
import { lockPageScroll } from "@/lib/smoothScroll";
import { FlagIsrael, FlagSouthAfrica } from "./Flags";

const ABOUT_IMG = "/images/about-1100.webp";

const PULL_LINE = /^(Everything is good\. Everything is Shweet\.|הכול טוב\. הכול שוויט\.)\s*([\s\S]*)$/;

/*
 * The story is plain text with blank lines between paragraphs.
 * Short lines without a full stop become Bebas sub-heads, lines starting
 * with "•" or "1." become list items, and the closing
 * "Everything is good. Everything is Shweet." becomes a big red line.
 */
function StoryText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const bodyStyle = { color: "oklch(0.80 0.020 75)", lineHeight: 1.8 };

  return (
    <div className="mb-10 max-w-[65ch]">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const isItem = (l: string) => /^(•|\d+\.)\s*/.test(l);
        const pull = block.match(PULL_LINE);

        if (pull) {
          return (
            <div key={i} className="mt-12">
              <p
                className="font-display mb-4"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 0.95,
                  letterSpacing: "0.03em",
                  color: "var(--accent)",
                  textWrap: "balance",
                }}
              >
                {pull[1]}
              </p>
              {pull[2] && <p className="text-lg" style={bodyStyle}>{pull[2]}</p>}
            </div>
          );
        }

        if (lines.length === 1 && lines[0].length < 60 && !/[.!:]$/.test(lines[0])) {
          return (
            <h4
              key={i}
              className="font-display mt-12 mb-4"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                lineHeight: 1,
                letterSpacing: "0.04em",
                color: "var(--foreground)",
              }}
            >
              {lines[0]}
            </h4>
          );
        }

        const lead = lines.filter((l) => !isItem(l));
        const items = lines.filter(isItem);
        return (
          <div key={i} className="mb-6">
            {lead.length > 0 && (
              <p className="text-lg" style={bodyStyle}>{lead.join(" ")}</p>
            )}
            {items.length > 0 && (
              <ul className="mt-3 space-y-3">
                {items.map((item, j) => {
                  const clean = item.replace(/^(•|\d+\.)\s*/, "");
                  const [title, ...rest] = clean.split(":");
                  return (
                    <li key={j} className="flex gap-3 text-lg" style={bodyStyle}>
                      <span
                        aria-hidden="true"
                        className="mt-[0.7em] inline-block w-2 h-2 shrink-0 rotate-45"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                      <span>
                        {rest.length > 0 ? (
                          <>
                            <strong style={{ color: "var(--foreground)" }}>{title}:</strong>
                            {rest.join(":")}
                          </>
                        ) : (
                          clean
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/*
 * Shows the first ~5 lines of the story with a soft fade. "Read the full story" opens
 * the whole story in a popup, styled like the product info popup (portal over the page,
 * close on X / backdrop / Escape, page frozen behind it). If the story is short
 * it's shown in full with no button.
 */
const COLLAPSED_REM = 10; // about 5 lines of 1.125rem text at 1.8 line-height

function CollapsibleStory({ language, title, children }: { language: string; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [needed, setNeeded] = useState(true);
  const he = language === "he";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const collapsedPx = COLLAPSED_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
      setNeeded(el.scrollHeight > collapsedPx + 24);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.firstElementChild ?? el);
    return () => ro.disconnect();
  }, [language]);

  // Popup: freeze the page and close on Escape
  useEffect(() => {
    lockPageScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockPageScroll(false);
    };
  }, [open]);

  return (
    <div className="mb-10">
      <div
        ref={ref}
        className={`about-story ${needed ? "is-collapsed" : ""}`}
        style={{ maxHeight: needed ? `${COLLAPSED_REM}rem` : "none" }}
      >
        {children}
      </div>
      {needed && (
        <button type="button" className="about-story-toggle" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          {he ? "לסיפור המלא" : "Read the full story"}
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 info-modal-backdrop"
            style={{ backgroundColor: "oklch(0 0 0 / 0.7)" }}
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              data-lenis-prevent
              className="info-modal about-story-modal relative w-full max-w-[42rem] max-h-[88vh] overflow-y-auto rounded-lg p-5 sm:p-8"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid color-mix(in oklab, var(--accent) 60%, transparent)",
                boxShadow: "0 30px 80px oklch(0 0 0 / 0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={he ? "סגור" : "Close"}
                autoFocus
                className="absolute top-4 end-4 w-10 h-10 grid place-items-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: "var(--foreground)" }}
              >
                <X className="w-6 h-6" />
              </button>
              <h2
                className="pe-12 mb-6"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.9rem, 4vw, 2.6rem)", lineHeight: 1, letterSpacing: "0.03em", color: "var(--foreground)" }}
              >
                {title}
              </h2>
              {children}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default function AboutSection() {
  const { language } = useLanguage();
  return (
    <section
      id="about"
      className="py-24 md:py-40 relative"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="section-title mb-6">
            {translations.about.sectionTitle[language]}
          </h2>
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto"
            style={{ color: "oklch(0.80 0.020 75)" }}
          >
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>{translations.about.bornInSa[language]}</span> <span style={{ color: "oklch(0.50 0.18 260)", fontWeight: 700 }}>{translations.about.proudIsraeli[language]}</span>
          </p>
        </div>

        {/* Main Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
          {/* Left - Image */}
          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 30px 80px oklch(0 0 0 / 0.6)" }}
            >
              <img
                src={ABOUT_IMG}
                srcSet="/images/about-640.webp 640w, /images/about-1100.webp 1100w"
                sizes="(min-width: 1024px) 600px, 92vw"
                loading="lazy"
                decoding="async"
                alt="Shweet Brew founders at a braai with Israeli and South African flags"
                className="w-full h-full object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-6 -right-6 md:bottom-8 md:right-8 p-6 rounded-xl border text-center shadow-2xl"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--accent)",
                borderWidth: "2px",
                boxShadow: "0 0 40px color-mix(in oklab, var(--accent) 30%, transparent)",
              }}
            >
              <div
                className="font-display text-5xl mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="inline-flex items-center gap-2 align-middle" aria-label="South Africa and Israel">
                  <FlagSouthAfrica className="w-12 h-9 rounded-sm" />
                  <span aria-hidden="true">+</span>
                  <FlagIsrael className="w-12 h-9 rounded-sm" />
                </span>
              </div>
              <div
                className="font-body text-sm tracking-widest font-bold"
                style={{ color: "var(--brand-fire-bright)", letterSpacing: "0.15em" }}
              >
                {translations.about.twoNations[language]}
              </div>
              <div
                className="font-body text-sm tracking-widest font-bold"
                style={{ color: "var(--brand-fire-bright)", letterSpacing: "0.15em" }}
              >
                {translations.about.oneBraai[language]}
              </div>
            </div>
          </div>

          {/* Right - Story Text */}
          <div>

            <h3
              className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "oklch(0.94 0.025 75)",
                letterSpacing: "0.02em",
              }}
            >
              {language === "en" ? SITE_CONFIG.about.headline : translations.about.headlineHe.he}
            </h3>

            <CollapsibleStory language={language} title={language === "en" ? SITE_CONFIG.about.headline : translations.about.headlineHe.he}>
              <StoryText text={language === "en" ? SITE_CONFIG.about.story : SITE_CONFIG.about.storyHe} />
            </CollapsibleStory>

          </div>
        </div>

        {/* Values: four plain statements in one row, separated by hairlines (no cards, no emoji) */}
        <div className="mt-24 pt-12 border-t" style={{ borderColor: "oklch(1 0 0 / 10%)" }}>
          <h3 className="sr-only">{language === "en" ? "Our values" : "הערכים שלנו"}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {(["beef100", "kosherCert", "authenticRecipes", "israeliPride"] as const).map((key, idx) => (
              <div
                key={key}
                className={`py-6 lg:px-6 first:lg:ps-0 ${idx > 0 ? "border-t lg:border-t-0 lg:border-s" : ""}`}
                style={{ borderColor: "oklch(1 0 0 / 10%)" }}
              >
                <h4
                  className="mb-2"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem", lineHeight: 1, letterSpacing: "0.03em", color: "var(--foreground)" }}
                >
                  {(translations.about as any)[key][language]}
                </h4>
                <p style={{ color: "var(--brand-cream-dim)" }}>
                  {(translations.about as any)[`${key}Desc`][language]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission: a large statement set in the display face, no box or glow */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <h3 className="sr-only">{translations.about.missionTitle[language]}</h3>
          <p
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(1.9rem, 3.6vw, 3rem)",
              lineHeight: 1.08,
              letterSpacing: "0.02em",
              color: "var(--foreground)",
              textWrap: "balance",
            }}
          >
            {translations.about.missionDesc[language]}
          </p>
        </div>
      </div>
    </section>
  );
}
