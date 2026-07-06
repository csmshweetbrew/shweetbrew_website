/*
 * SHWEETBREW DELIVERY SECTION
 * Design: Dark background with Israeli blue delivery zone cards
 * Comprehensive delivery zones with pricing and delivery days
 */

import { MapPin, Truck, Clock, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { deliveryZones } from "@/config/deliveryZones";

// Get all zones for the display (excluding "Everywhere Else")
const getFeaturedZones = (language: string) => {
  const featured = deliveryZones.filter((z) => z.id !== "zone_everywhere_else");

  return featured.map((zone) => {
    let fee: string;
    if (zone.price === -1) {
      fee = language === "en" ? "Please contact us" : "אנא צור איתנו קשר";
    } else if (zone.price === 0) {
      fee = language === "en" ? "FREE" : "חינם";
    } else {
      fee = `₪${zone.price}`;
    }

    return {
      id: zone.id,
      name: typeof zone.name === "string" ? zone.name : zone.name,
      fee,
      days: zone.deliveryDays.join(" & "),
      cities: zone.cities,
      highlight: zone.id === "modiin",
      icon: zone.icon,
    };
  });
};

export default function DeliverySection() {
  const { language } = useLanguage();
  const zones = getFeaturedZones(language);

  return (
    <section
      id="delivery"
      className="py-20 md:py-28"
      style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
    >
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="font-body text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--accent)", letterSpacing: "0.25em" }}
          >
            — {translations.delivery.sectionTitle[language]} —
          </div>
          <h2
            className="font-display leading-none mb-4"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "oklch(0.94 0.025 75)",
            }}
          >
            {language === "en" ? "We Deliver" : "אנחנו משלחים"}{" "}
            <span style={{ color: "oklch(0.50 0.18 260)" }}>{translations.delivery.sectionSubtitle[language]}</span>
          </h2>
          <p
            className="font-body text-base max-w-xl mx-auto"
            style={{ color: "oklch(0.65 0.015 75)" }}
          >
            {translations.delivery.description[language]}
          </p>
        </div>

        {/* South Delivery Banner */}


        {/* Delivery zones grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="p-5 rounded-lg border transition-all"
              style={{
                backgroundColor: zone.highlight ? "oklch(0.35 0.15 260 / 0.15)" : "oklch(0.18 0.006 60)",
                borderColor: zone.highlight ? "oklch(0.50 0.18 260)" : "oklch(1 0 0 / 0.10)",
                boxShadow: zone.highlight ? "0 0 20px oklch(0.35 0.15 260 / 0.2)" : "none",
              }}
            >
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{zone.icon}</span>
                  <div className="flex-1">
                    <div
                      className="font-body font-bold text-sm"
                      style={{ color: "oklch(0.94 0.025 75)" }}
                    >
                      {zone.name}
                      {zone.highlight && (
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{
                            backgroundColor: "oklch(0.65 0.18 260)",
                            color: "oklch(0.15 0.01 260)",
                          }}
                        >
                          {language === "en" ? "HQ" : "ראש הממשלה"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="font-body text-xs"
                  style={{ color: "oklch(0.55 0.015 75)" }}
                >
                  {language === "en" ? "Delivery: " : "משלוח: "}{zone.days}
                </div>
              </div>
              {zone.cities && zone.cities.length > 0 && (
                <div
                  className="font-body text-xs mb-3 pb-3 border-b"
                  style={{ color: "oklch(0.70 0.015 75)", borderColor: "oklch(0.62 0.20 42 / 0.3)" }}
                >
                  <div style={{ color: "oklch(0.80 0.020 75)", marginBottom: "0.25rem", fontWeight: "600" }}>
                    {language === "en" ? "Cities:" : "עירות:"}
                  </div>
                  <div>{zone.cities.join(", ")}</div>
                </div>
              )}
              <div
                className="font-display text-2xl"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: zone.highlight ? "oklch(0.50 0.18 260)" : "var(--accent)",
                  letterSpacing: "0.04em",
                }}
              >
                {zone.fee}
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Schedule Notice */}
        <div
          className="p-6 rounded-lg border mb-8"
          style={{
            backgroundColor: "oklch(0.21 0.006 285.885)",
            borderColor: "oklch(0.62 0.20 42 / 0.5)",
          }}
        >
          <h3
            className="font-body font-bold mb-3"
            style={{ color: "oklch(0.94 0.025 75)", fontSize: "1.125rem" }}
          >
            {language === "en" ? "Delivery Schedule Notice" : "העדכון לשידול דרום"}
          </h3>
          <p
            className="font-body text-sm mb-3"
            style={{ color: "oklch(0.80 0.020 75)" }}
          >
            {language === "en"
              ? "Delivery days vary by city and region. Please place your order before Wednesday to ensure it is included in your area's next delivery cycle. Orders received after Wednesday will be scheduled for the following week."
              : "ימי דרום שונים לפי עיר ואזור. בבקשה הזמינו שלכם לפני יום רביעי כדי לוודא שההזמינה תוכנה בסידור דרום הבא באזורך. הזמינות שהוערו אחרי יום רביעי ישודלו בשבוע הבא."
            }
          </p>
          <p
            className="font-body text-sm"
            style={{ color: "oklch(0.65 0.15 120)" }}
          >
            {language === "en"
              ? "Need it sooner? Urgent deliveries can be accommodated for an additional fee. Please contact us directly to arrange a rush order."
              : "צריכים בהדרך? דרומים דחופים יכולים להיות משומ בעידו נוסף. אנא הצטרפו אלינו ישירות לסדר הזמינה מהירה."
            }
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Truck className="w-6 h-6" />,
              title: translations.delivery.minimumOrderTitle[language],
              desc: translations.delivery.minimumOrderDesc[language],
            },
            {
              icon: <Clock className="w-6 h-6" />,
              title: translations.delivery.cutoffTitle[language],
              desc: translations.delivery.cutoffDesc[language],
            },
            {
              icon: <CreditCard className="w-6 h-6" />,
              title: translations.delivery.paymentTitle[language],
              desc: translations.delivery.paymentDesc[language],
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              title: translations.delivery.pickupTitle[language],
              desc: translations.delivery.pickupDesc[language],
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-lg border"
              style={{
                backgroundColor: "oklch(0.18 0.006 60)",
                borderColor: "oklch(1 0 0 / 0.08)",
              }}
            >
              <div
                className="mb-3"
                style={{ color: "var(--accent)" }}
              >
                {item.icon}
              </div>
              <h3
                className="font-display font-bold text-sm mb-2"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: "oklch(0.97 0.005 260)",
                  letterSpacing: "0.04em",
                }}
              >
                {item.title}
              </h3>
              <p
                className="font-body text-xs leading-relaxed"
                style={{ color: "oklch(0.65 0.015 75)" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
