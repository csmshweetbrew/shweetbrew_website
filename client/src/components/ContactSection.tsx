/*
 * SHWEETBREW CONTACT SECTION
 * Phone, email and a WhatsApp button. WhatsApp is for questions; orders are placed on the site.
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";

export default function ContactSection() {
  const { language } = useLanguage();
  const handleWhatsAppClick = () => {
    window.open(getWhatsAppLink("Hi Shweet Brew! I'd like to get in touch"), "_blank");
  };

  return (
    <section
      className="py-20 md:py-32"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            {translations.contact.sectionTitle[language]}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "oklch(0.80 0.020 75)" }}
          >
            {translations.contact.subtitle[language]}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <p
                className="text-sm font-bold tracking-widest mb-2"
                style={{ color: "var(--brand-fire-bright)", letterSpacing: "0.15em" }}
              >
                {translations.contact.whatsappUs[language]}
              </p>
              <a
                href={`https://wa.me/${SITE_CONFIG.contact.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold transition-colors hover:text-fire"
                style={{ color: "oklch(0.94 0.025 75)" }}
              >
                <bdi dir="ltr">{SITE_CONFIG.contact.whatsappDisplay}</bdi>
              </a>
            </div>

            <div>
              <p
                className="text-sm font-bold tracking-widest mb-2"
                style={{ color: "var(--brand-fire-bright)", letterSpacing: "0.15em" }}
              >
                {translations.contact.emailUs[language]}
              </p>
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="text-xl font-bold transition-colors hover:text-fire"
                style={{ color: "oklch(0.94 0.025 75)" }}
              >
                {SITE_CONFIG.contact.email}
              </a>
            </div>

            <div>
              <p className="text-lg leading-relaxed" style={{ color: "var(--brand-cream-dim)" }}>
                {language === "en"
                  ? "Questions about the products, or wholesale for shops and events? Message us."
                  : "שאלות על המוצרים, או מכירה סיטונאית לחנויות ולאירועים? כתבו לנו."}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="rounded-lg p-8"
            style={{
              backgroundColor: "var(--card)",
              border: "2px solid var(--accent)",
            }}
          >
            <div className="text-center py-12">
              <h3
                className="text-3xl font-bold mb-4"
                style={{ color: "oklch(0.94 0.025 75)" }}
              >
                {language === "en" ? "Chat with Us on WhatsApp" : "דברו איתנו ב-WhatsApp"}
              </h3>
              <p style={{ color: "oklch(0.80 0.020 75)" }} className="mb-8 text-lg">
                {language === "en" ? "The fastest way to reach us. Click the button below to start a conversation." : "הדרך המהירה ביותר להגיע אלינו. לחצו על הכפתור למטה כדי להתחיל שיחה."}
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-3 px-8 py-4 rounded font-bold text-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "#25D366",
                  color: "#052b13",
                  boxShadow: "0 0 30px rgba(37,211,102,0.4)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {language === "en" ? "Message Us Now" : "שלחו הודעה עכשיו"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
