/*
 * SHWEETBREW CONTACT PAGE
 * Contact form with inquiry types and WhatsApp integration
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { useState } from "react";
import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type InquiryType = "order" | "question" | "wholesale" | "other";

export default function Contact() {
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
      ``,
      `*Message:*`,
      form.message,
    ].join("\n");

    window.open(getWhatsAppLink(message), "_blank");

    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({
        name: "",
        email: "",
        phone: "",
        inquiryType: "order",
        message: "",
      });
      setSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => setSubmitted(false), 3000);
    }, 500);
  };

  return (
    <div style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
      {/* Hero */}
      <section className="py-20 px-4" style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
        <div className="container max-w-4xl text-center mb-16">
          <p className="text-sm font-bold mb-4 tracking-widest" style={{ color: "var(--accent)" }}>
            — GET IN TOUCH —
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ color: "oklch(0.97 0.005 260)" }}>
            Let's Talk <span style={{ color: "var(--accent)" }}>Biltong</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: "oklch(0.80 0.020 75)" }}>
            Questions? Orders? Wholesale inquiries? We're here to help. Reach out and let's connect.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="container max-w-4xl mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                border: "2px solid #25D366",
              }}
            >
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                WhatsApp
              </h3>
              <p className="mb-4" style={{ color: "oklch(0.80 0.020 75)" }}>
                {SITE_CONFIG.contact.whatsappDisplay}
              </p>
              <Button
                onClick={() =>
                  window.open(
                    getWhatsAppLink("Hi Shweet Brew! I'd like to get in touch."),
                    "_blank"
                  )
                }
                className="w-full font-bold"
                style={{
                  backgroundColor: "#25D366",
                  color: "#fff",
                }}
              >
                Chat Now
              </Button>
            </div>

            {/* Email */}
            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                border: "2px solid var(--accent)",
              }}
            >
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                Email
              </h3>
              <p className="mb-4" style={{ color: "oklch(0.80 0.020 75)" }}>
                {SITE_CONFIG.contact.email}
              </p>
              <Button
                onClick={() => (window.location.href = `mailto:${SITE_CONFIG.contact.email}`)}
                className="w-full font-bold"
                style={{
                  backgroundColor: "oklch(0.35 0.15 260)",
                  color: "oklch(0.97 0.005 260)",
                }}
              >
                Send Email
              </Button>
            </div>

            {/* Phone */}
            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                border: "2px solid oklch(0.35 0.15 260)",
              }}
            >
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                Phone
              </h3>
              <p className="mb-4" style={{ color: "oklch(0.80 0.020 75)" }}>
                {SITE_CONFIG.contact.whatsappDisplay}
              </p>
              <Button
                onClick={() => (window.location.href = `tel:${SITE_CONFIG.contact.phone}`)}
                className="w-full font-bold"
                style={{
                  backgroundColor: "oklch(0.50 0.18 260)",
                  color: "oklch(0.97 0.005 260)",
                }}
              >
                Call Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4" style={{ backgroundColor: "oklch(0.15 0.005 60)" }}>
        <div className="container max-w-2xl">
          <h2 className="font-display text-3xl font-bold mb-8 text-center" style={{ color: "oklch(0.97 0.005 260)" }}>
            Send Us a Message
          </h2>

          {submitted ? (
            <div
              className="p-8 rounded-lg text-center"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                border: "2px solid #25D366",
              }}
            >
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-2xl mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                Message Sent!
              </h3>
              <p style={{ color: "oklch(0.80 0.020 75)" }}>
                Thanks for reaching out. We'll get back to you via WhatsApp as soon as possible.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                padding: "2rem",
                borderRadius: "0.5rem",
                border: "2px dashed var(--accent)",
              }}
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  placeholder="050-123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                  required
                />
              </div>

              {/* Inquiry Type */}
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: "oklch(0.97 0.005 260)" }}>
                  What's this about?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {inquiryTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, inquiryType: type.value as InquiryType })}
                      className="p-3 rounded-lg text-sm font-bold transition-all"
                      style={{
                        backgroundColor:
                          form.inquiryType === type.value
                            ? "var(--accent)"
                            : "oklch(0.13 0.005 60)",
                        color:
                          form.inquiryType === type.value
                            ? "oklch(0.97 0.005 260)"
                            : "oklch(0.70 0.015 65)",
                        border:
                          form.inquiryType === type.value
                            ? "2px solid var(--accent)"
                            : "1px solid oklch(0.70 0.015 65)",
                      }}
                    >
                      <span className="block text-lg mb-1">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
                  Message *
                </label>
                <textarea
                  placeholder="Tell us what you're thinking..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold text-lg py-3"
                style={{
                  backgroundColor: "#25D366",
                  color: "#fff",
                }}
              >
                💬 Send via WhatsApp
              </Button>
              <p className="text-xs text-center" style={{ color: "oklch(0.70 0.015 65)" }}>
                Your message will be sent to our WhatsApp for fastest response.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
