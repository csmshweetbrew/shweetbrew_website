/*
 * SHWEETBREW ABOUT SECTION - PRIORITY SECTION
 * Full story of South African roots and Israeli pride
 * Design: Large, immersive layout with full story, values, and mission
 * Warm, personal storytelling tone with Zionistic pride
 */

import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";

const ABOUT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491314336/GHvX6FS9zEwj9cBKkXQgeg/shweetbrew-about-U8jtzjtUTgvoZwGw9kPPbK.webp";

export default function AboutSection() {
  const { language } = useLanguage();
  return (
    <section
      id="about"
      className="py-24 md:py-40 relative"
      style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2
            className="font-display text-5xl md:text-7xl font-bold mb-6"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "oklch(0.97 0.005 260)",
              letterSpacing: "0.05em",
            }}
          >
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
                alt="Shweet Brew founders at a braai with Israeli and South African flags"
                className="w-full h-full object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-6 -right-6 md:bottom-8 md:right-8 p-6 rounded-xl border text-center shadow-2xl"
              style={{
                backgroundColor: "oklch(0.18 0.006 60)",
                borderColor: "var(--accent)",
                borderWidth: "2px",
                boxShadow: "0 0 40px oklch(0.62 0.20 42 / 0.3)",
              }}
            >
              <div
                className="font-display text-5xl mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                🇿🇦 + 🇮🇱
              </div>
              <div
                className="font-body text-sm tracking-widest font-bold"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                {translations.about.twoNations[language]}
              </div>
              <div
                className="font-body text-sm tracking-widest font-bold"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                {translations.about.oneBraai[language]}
              </div>
            </div>
          </div>

          {/* Right - Story Text */}
          <div>
            <div
              className="font-body text-xs tracking-widest uppercase mb-6"
              style={{ color: "var(--accent)", letterSpacing: "0.25em" }}
            >
              {language === "en" ? "WHO WE ARE" : "מי אנחנו"}
            </div>

            <h3
              className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "oklch(0.97 0.005 260)",
                letterSpacing: "0.02em",
              }}
            >
              {language === "en" ? SITE_CONFIG.about.headline : translations.about.headlineHe.he}
            </h3>

            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: "oklch(0.80 0.020 75)", lineHeight: "1.8" }}
            >
              {language === "en" ? SITE_CONFIG.about.story : translations.about.storyHe.he}
            </p>

            <a
              href={getWhatsAppLink("Hi Shweet Brew! I'd love to learn more about your story!")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded font-body font-bold text-lg tracking-wide transition-all hover:scale-105"
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
                boxShadow: "0 0 30px rgba(37,211,102,0.4), 0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {language === "en" ? "Chat with Us" : "דבר איתנו"}
            </a>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mt-24 pt-24 border-t" style={{ borderColor: "oklch(1 0 0 / 10%)" }}>
          <h3
            className="font-display text-4xl font-bold text-center mb-16"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "oklch(0.97 0.005 260)",
              letterSpacing: "0.05em",
            }}
          >
            {language === "en" ? "OUR VALUES" : "הערכים שלנו"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🥩",
                titleKey: "beef100",
                descKey: "beef100Desc",
              },
              {
                icon: "✡",
                titleKey: "kosherCert",
                descKey: "kosherCertDesc",
              },
              {
                icon: "🇿🇦",
                titleKey: "authenticRecipes",
                descKey: "authenticRecipesDesc",
              },
              {
                icon: "🇮🇱",
                titleKey: "israeliPride",
                descKey: "israeliPrideDesc",
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="p-8 rounded-lg text-center transition-all hover:shadow-lg"
                style={{
                  backgroundColor: "oklch(0.21 0.006 285.885)",
                  border: "2px solid oklch(0.62 0.20 42 / 0.3)",
                  borderLeft: "4px solid var(--accent)",
                }}
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h4
                  className="font-display text-2xl font-bold mb-3"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: "oklch(0.97 0.005 260)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {(translations.about as any)[value.titleKey][language]}
                </h4>
                <p style={{ color: "oklch(0.80 0.020 75)" }}>
                  {(translations.about as any)[value.descKey][language]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div
          className="mt-24 p-12 md:p-16 rounded-2xl text-center"
          style={{
            backgroundColor: "oklch(0.21 0.006 285.885)",
            border: "3px solid var(--accent)",
            boxShadow: "0 0 40px oklch(0.62 0.20 42 / 0.2)",
          }}
        >
          <h3
            className="font-display text-4xl md:text-5xl font-bold mb-6"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "var(--accent)",
              letterSpacing: "0.05em",
            }}
          >
            {translations.about.missionTitle[language]}
          </h3>
          <p
            className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto"
            style={{ color: "oklch(0.80 0.020 75)" }}
          >
            {translations.about.missionDesc[language]}
          </p>
        </div>
      </div>
    </section>
  );
}
