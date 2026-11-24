/*
 * SHWEETBREW DELIVERY SECTION
 * A price board: one block per zone (name, delivery days, towns) with the fee
 * in big red Bebas at the end of the block, two columns from 860px. Modiin HQ
 * first, tinted Israeli blue. The order cutoff sits large beside the heading;
 * practical details (cutoff, minimum, payment, pickup, rush) follow underneath.
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
      price: z.price,
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
    <section id="delivery" className="py-16 md:py-20">
      <div className="container"><div className="delivery-inner">
        <h2 className="section-title mb-3">
          {he ? (
            <>משלוחים לכל <span style={{ color: "var(--brand-israeli-blue-light)" }}>הארץ</span></>
          ) : (
            <>We deliver across <span style={{ color: "var(--brand-israeli-blue-light)" }}>Israel</span></>
          )}
        </h2>
        <div className="delivery-top">
          <div className="max-w-xl">
            <p className="text-lg" style={{ color: "var(--brand-cream-dim)" }}>
              {he
                ? "מכינים במודיעין, שולחים לכל הארץ. מצאו את האזור שלכם כדי לראות מתי ההזמנה מגיעה וכמה עולה המשלוח."
                : "Made in Modiin, sent all over the country. Find your area to see which days we deliver and what it costs."}
            </p>
          </div>
          <div className="delivery-cutoff">
            <div className="delivery-cutoff-label">{he ? "הזמינו עד" : "Order by"}</div>
            <div className="delivery-cutoff-value">
              {he ? "רביעי" : "Wednesday"} <span>12:00</span>
            </div>
          </div>
        </div>

        <ul className="delivery-board" aria-label={he ? "אזורי משלוח" : "Delivery areas"}>
          {zones.map((z) => (
            <li key={z.id} className={`delivery-row ${z.hq ? "is-hq" : ""}`}>
              <div className="min-w-0">
                <div className="delivery-name">
                  <span className="delivery-zone">{z.name}</span>
                  <span className="delivery-days">{z.days}</span>
                </div>
                <div className="delivery-towns">
                  {z.hq ? (he ? "איסוף עצמי או משלוח באותו יום" : "Free pickup or same-day delivery") : z.towns}
                </div>
              </div>
              <div className="delivery-price" aria-label={he ? "מחיר משלוח" : "Delivery fee"}>
                {z.price === 0 ? (he ? "חינם" : "Free") : z.price === -1 ? "—" : <><small>₪</small>{z.price}</>}
              </div>
            </li>
          ))}
        </ul>
        <p className="delivery-other">
          {he
            ? "לא רואים את האזור שלכם? כתבו לנו ב-WhatsApp ונמצא פתרון."
            : "Don't see your area? Message us on WhatsApp and we'll work it out."}
        </p>

        {/* Practical details */}
        <dl className="delivery-facts">
          {facts.map((f) => (
            <div key={f.title}>
              <dt className="font-bold" style={{ color: "var(--foreground)" }}>{f.title}</dt>
              <dd className="mt-1 text-[0.95rem] leading-relaxed" style={{ color: "var(--brand-cream-dim)" }}>{f.desc}</dd>
            </div>
          ))}
        </dl>
      </div></div>
    </section>
  );
}
