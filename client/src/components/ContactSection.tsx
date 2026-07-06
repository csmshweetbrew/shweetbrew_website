/*
 * SHWEETBREW CONTACT SECTION
 * Contact form with inquiry types and WhatsApp integration
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { useState } from "react";
import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";

type InquiryType = "order" | "question" | "wholesale" | "other";

export default function ContactSection() {
  const { language } = useLanguage();
  const handleWhatsAppClick = () => {
    window.open(getWhatsAppLink("Hi Shweet Brew! I'd like to get in touch"), "_blank");
  };
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "order" as InquiryType,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inquiryTypes = [
    { value: "order", label: "Order", icon: "🛒" },
    { value: "question", label: "Question", icon: "❓" },
    { value: "wholesale", label: "Wholesale", icon: "📦" },
    { value: "other", label: "Other", icon: "💬" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const inquiryTypeLabel = inquiryTypes.find((t) => t.value === form.inquiryType)?.label || form.inquiryType;

    const message = [
      `*Shweet Brew Contact Form Submission*`,
      ``,
      `*Inquiry Type:* ${inquiryTypeLabel}`,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      `*Phone:* ${form.phone}`,
      `*Message:* ${form.message}`,
    ].join("\n");

    setTimeout(() => {
      window.open(getWhatsAppLink(message), "_blank");
      setSubmitted(true);
      setIsSubmitting(false);
      toast.success("Message sent! Opening WhatsApp...");

      setTimeout(() => {
        setForm({ name: "", email: "", phone: "", inquiryType: "order", message: "" });
        setSubmitted(false);
      }, 3000);
    }, 500);
  };

  return (
    <section
      className="py-20 md:py-32"
      style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "oklch(0.97 0.005 260)",
              letterSpacing: "0.05em",
            }}
          >
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
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                {translations.contact.whatsappUs[language]}
              </p>
              <a
                href={`https://wa.me/${SITE_CONFIG.contact.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold transition-colors hover:text-fire"
                style={{ color: "oklch(0.97 0.005 260)" }}
              >
                {SITE_CONFIG.contact.whatsappDisplay}
              </a>
            </div>

            <div>
              <p
                className="text-sm font-bold tracking-widest mb-2"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                {translations.contact.emailUs[language]}
              </p>
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="text-xl font-bold transition-colors hover:text-fire"
                style={{ color: "oklch(0.97 0.005 260)" }}
              >
                {SITE_CONFIG.contact.email}
              </a>
            </div>

            <div>
              <p
                className="text-sm font-bold tracking-widest mb-4"
                style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                {translations.contact.inquiryTypes[language]}
              </p>
              <div className="space-y-2">
                {inquiryTypes.map((type) => (
                  <div
                    key={type.value}
                    className="flex items-center gap-3 p-3 rounded"
                    style={{
                      backgroundColor: "oklch(0.21 0.006 285.885)",
                      borderLeft: "3px solid var(--accent)",
                    }}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span style={{ color: "oklch(0.80 0.020 75)" }}>
                      {language === "en" ? type.label : (type.value === "order" ? "הזמנה" : type.value === "question" ? "שאלה" : type.value === "wholesale" ? "סיטונאות" : "אחר")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="rounded-lg p-8"
            style={{
              backgroundColor: "oklch(0.21 0.006 285.885)",
              border: "2px solid var(--accent)",
            }}
          >
            <div className="text-center py-12">
              <div className="text-6xl mb-6">💬</div>
              <h3
                className="text-3xl font-bold mb-4"
                style={{ color: "oklch(0.97 0.005 260)" }}
              >
                {language === "en" ? "Chat with Us on WhatsApp" : "דברו איתנו ב-WhatsApp"}
              </h3>
              <p style={{ color: "oklch(0.80 0.020 75)" }} className="mb-8 text-lg">
                {language === "en" ? "The fastest way to reach us. Click the button below to start a conversation." : "הדרך המהירה ביותר להגיע אלינו. לחץ על הכפתור למטה כדי להתחיל שיחה."}
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-3 px-8 py-4 rounded font-bold text-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "#25D366",
                  color: "#fff",
                  boxShadow: "0 0 30px rgba(37,211,102,0.4)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {language === "en" ? "Message Us Now" : "שלח הודעה עכשיו"}
              </button>
            </div>
            {false && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: "oklch(0.80 0.020 75)" }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                    }}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: "oklch(0.80 0.020 75)" }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: "oklch(0.80 0.020 75)" }}
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                    }}
                    placeholder="+972 50 123 4567"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: "oklch(0.80 0.020 75)" }}
                  >
                    Inquiry Type
                  </label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value as InquiryType })}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                    }}
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: "oklch(0.80 0.020 75)" }}
                  >
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2 rounded border h-32"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                    }}
                    placeholder="Your message..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 font-bold text-lg"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send via WhatsApp"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
