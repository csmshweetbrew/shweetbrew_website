/*
 * SHWEETBREW DELIVERY SECTION
 * A delivery timetable: one row per zone (towns, days, fee), Modiin HQ first and
 * tinted Israeli blue. Practical details (minimum, cutoff, payment, pickup) sit
 * beside it as a short definition list instead of a grid of identical cards.
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { deliveryZones, zoneName, zoneCities, zoneDays } from "@/config/deliveryZones";

export default function DeliverySection() {
  const { language } = useLanguage();
  const he = language === "he";
  const t = translations.delivery;

  const zones = deliveryZones
    .filter((z) => z.id !== "zone_everywhere_else")
    .map((z) => ({
      id: z.id,
      name: zoneName(z, language),
      towns: zoneCities(z, language).join(", "),
      days: zoneDays(z, language),
      fee: z.price === 0 ? (he ? "חינם" : "Free") : z.price === -1 ? "—" : `₪${z.price}`,
      hq: z.id === "modiin",
    }));

  const facts = [
    { title: t.cutoffTitle[language], desc: he
        ? "הזמינו עד יום רביעי כדי להיכנס לסבב המשלוחים הקרוב באזורכם. הזמנות אחרי רביעי עוברות לשבוע הבא."
        : "Order by Wednesday to make your area's next delivery run. Orders after Wednesday go out the following week." },
    { title: t.minimumOrderTitle[language], desc: t.minimumOrderDesc[language] },
    { title: t.paymentTitle[language], desc: t.paymentDesc[language] },
    { title: t.pickupTitle[language], desc: t.pickupDesc[language] },
    { title: he ? "צריכים את זה מהר?" : "Need it sooner?", desc: he
        ? "אפשר לתאם משלוח דחוף בתוספת תשלום. כתבו לנו ב-WhatsApp."
        : "Rush delivery is possible for an extra fee. Message us on WhatsApp to arrange it." },
  ];

  return (
    <section id="delivery" className="py-20 md:py-28" style={{ backgroundColor: "var(--background)" }}>
      <div className="container">
        <div className="mb-12 max-w-3xl">
          <h2 className="section-title mb-4">
            {he ? "משלוחים לכל הארץ" : "We deliver across Israel"}
          </h2>
          <p className="text-lg" style={{ color: "var(--brand-cream-dim)" }}>
            {he
              ? "מכינים במודיעין, שולחים לכל הארץ. מצאו את האזור שלכם כדי לראות מתי ההזמנה מגיעה וכמה עולה המשלוח."
              : "Made in Modiin, sent all over the country. Find your area to see which days we deliver and what it costs."}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-16 items-start">
          {/* Timetable */}
          <div className="delivery-table" role="table" aria-label={he ? "אזורי משלוח" : "Delivery areas"}>
            <div className="delivery-row delivery-head" role="row">
              <span role="columnheader">{he ? "אזור" : "Area"}</span>
              <span role="columnheader">{he ? "ימי משלוח" : "Delivery days"}</span>
              <span role="columnheader" className="delivery-fee">{he ? "משלוח" : "Fee"}</span>
            </div>
            {zones.map((z) => (
              <div key={z.id} role="row" className={`delivery-row ${z.hq ? "is-hq" : ""}`}>
                <div role="cell" className="min-w-0">
                  <div className="delivery-zone">
                    {z.name}
                  </div>
                  {!z.hq && <div className="delivery-towns">{z.towns}</div>}
                  {z.hq && (
                    <div className="delivery-towns">
                      {he ? "איסוף עצמי או משלוח באותו יום" : "Free pickup or same-day delivery"}
                    </div>
                  )}
                </div>
                <div role="cell" className="delivery-days">{z.days}</div>
                <div role="cell" className="delivery-fee delivery-price">{z.fee}</div>
              </div>
            ))}
            <p className="delivery-other">
              {he
                ? "לא רואים את האזור שלכם? כתבו לנו ב-WhatsApp ונמצא פתרון."
                : "Don't see your area? Message us on WhatsApp and we'll work it out."}
            </p>
          </div>

          {/* Practical details */}
          <dl className="grid gap-6">
            {facts.map((f) => (
              <div key={f.title} className="grid gap-1">
                <dt className="font-bold" style={{ color: "var(--foreground)" }}>{f.title}</dt>
                <dd className="text-[0.95rem] leading-relaxed" style={{ color: "var(--brand-cream-dim)" }}>{f.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
