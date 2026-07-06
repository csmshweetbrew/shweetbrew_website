/*
 * SHWEETBREW ABOUT US PAGE
 * Full story of South African roots and Israeli pride
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { Button } from "@/components/ui/button";
import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { language } = useLanguage();
  return (
    <div style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
      {/* Hero Section */}
      <section className="py-20 px-4" style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-bold mb-4 tracking-widest" style={{ color: "var(--accent)" }}>
              — OUR STORY —
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ color: "oklch(0.97 0.005 260)" }}>
              Born in South Africa.
              <br />
              <span style={{ color: "var(--accent)" }}>Proud to be Israeli.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: "oklch(0.80 0.020 75)" }}>
              Two nations. One braai. One mission: to bring authentic South African biltong to Israel with Israeli pride
              and SA soul.
            </p>
          </div>

          {/* Main Story */}
          <div className="space-y-8 mb-16">
            <div
              className="p-8 rounded-lg"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                borderLeft: "6px solid var(--accent)",
              }}
            >
              <h2 className="font-display text-3xl font-bold mb-4" style={{ color: "oklch(0.97 0.005 260)" }}>
                The Beginning
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "oklch(0.80 0.020 75)" }}>
                Shweet Brew was born out of a simple, undeniable truth: South Africans make the best biltong in the
                world, and Israel deserves to taste it.
              </p>
              <p className="text-lg leading-relaxed mt-4" style={{ color: "oklch(0.80 0.020 75)" }}>
                We're a proudly South African family who made aliyah and brought our most important cultural export
                with us — the braai. The biltong. The drywors. The whole shebang. We couldn't find anything that tasted
                like home, so we started making it ourselves. One batch turned into two. Two turned into a business. And
                here we are.
              </p>
            </div>

            <div
              className="p-8 rounded-lg"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                borderLeft: "6px solid oklch(0.35 0.15 260)",
              }}
            >
              <h2 className="font-display text-3xl font-bold mb-4" style={{ color: "oklch(0.97 0.005 260)" }}>
                Our Values
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "oklch(0.80 0.020 75)" }}>
                We are Zionistic to our core. We love this land, we love this people, and we believe that good food —
                real food — brings people together. Whether you're a Joburg expat missing the taste of home, an Israeli
                who's never tried biltong, or an American who wants to understand what all the fuss is about: welcome to
                Shweet Brew.
              </p>
              <p className="text-lg leading-relaxed mt-4" style={{ color: "oklch(0.80 0.020 75)" }}>
                Every product is made with 100% beef, authentic SA spices, and the kind of care that only comes from
                people who grew up eating this stuff. No shortcuts. No compromises. Just meat, done right.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="mb-16">
            <h2 className="font-display text-3xl font-bold mb-8 text-center" style={{ color: "oklch(0.97 0.005 260)" }}>
              What We Stand For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SITE_CONFIG.about.values.map((value, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-lg text-center"
                  style={{
                    backgroundColor: "oklch(0.21 0.006 285.885)",
                    border: "2px solid var(--accent)",
                  }}
                >
                  <div className="text-5xl mb-3">{value.icon}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                    {value.title}
                  </h3>
                  <p style={{ color: "oklch(0.80 0.020 75)" }}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who We Serve */}
          <div
            className="p-8 rounded-lg mb-16"
            style={{
              backgroundColor: "oklch(0.21 0.006 285.885)",
              borderLeft: "6px solid var(--accent)",
            }}
          >
            <h2 className="font-display text-3xl font-bold mb-4" style={{ color: "oklch(0.97 0.005 260)" }}>
              Who We Serve
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-2">🇿🇦</div>
                <h4 className="font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Joburg Expats
                </h4>
                <p style={{ color: "oklch(0.80 0.020 75)" }}>
                  Missing the taste of home? We've got you covered. This is the biltong you grew up with.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🇮🇱</div>
                <h4 className="font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Israelis
                </h4>
                <p style={{ color: "oklch(0.80 0.020 75)" }}>
                  Never tried biltong? Now's your chance. Join thousands discovering authentic SA braai culture.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🇺🇸</div>
                <h4 className="font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Meat Lovers
                </h4>
                <p style={{ color: "oklch(0.80 0.020 75)" }}>
                  Protein seekers, gym-goers, and anyone who believes in real food. 100% beef, no nonsense.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-lg mb-6" style={{ color: "oklch(0.80 0.020 75)" }}>
              Ready to taste the difference?
            </p>
            <Button
              onClick={() => window.open(getWhatsAppLink("Hi Shweet Brew! Tell me more about your products!"), "_blank")}
              className="font-bold text-lg px-8 py-3"
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
              }}
            >
              💬 Chat with Us on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4" style={{ backgroundColor: "oklch(0.15 0.005 60)" }}>
        <div className="container max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-4xl font-bold mb-2" style={{ color: "var(--accent)" }}>
                7+
              </div>
              <p style={{ color: "oklch(0.70 0.015 65)" }}>{language === "en" ? "Products" : "מוצרים"}</p>
            </div>
            <div>
              <div className="font-display text-4xl font-bold mb-2" style={{ color: "var(--accent)" }}>
                100%
              </div>
              <p style={{ color: "oklch(0.70 0.015 65)" }}>{language === "en" ? "Beef" : "בשר בקר"}</p>
            </div>
            <div>
              <div className="font-display text-4xl font-bold mb-2" style={{ color: "var(--accent)" }}>
                200+
              </div>
              <p style={{ color: "oklch(0.70 0.015 65)" }}>{language === "en" ? "Happy Customers" : "לקוחות שמחים"}</p>
            </div>
            <div>
              <div className="font-display text-4xl font-bold mb-2" style={{ color: "var(--accent)" }}>
                🇮🇱
              </div>
              <p style={{ color: "oklch(0.70 0.015 65)" }}>{language === "en" ? "Israel-wide" : "בכל רחבי ישראל"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
