/*
 * SHWEETBREW ANNOUNCEMENT BAR
 * Scrolling ticker with key messages — Israeli blue background
 */

import { useLanguage } from "@/contexts/LanguageContext";

export default function AnnouncementBar() {
  const { language } = useLanguage();

  const messages = language === "en" ? [
    "🥩 Free delivery in Modiin",
    "✡ Kosher options available",
    "🇿🇦 Authentic SA recipes",
    "🇮🇱 Proudly Israeli",
    "🔥 New: Wasabi Biltong",
    "💬 Order via WhatsApp — fast & easy",
    "🚚 Delivery across Israel",
    "🥃 Shweet Brew Shots — try it once, order forever",
  ] : [
    "🥩 משלוח חינם בעיר מודיעין",
    "✡ אפשרויות כשר זמינות",
    "🇿🇦 מתכונים אותנטיים מדרום אפריקה",
    "🇮🇱 בגאווה ישראלית",
    "🔥 חדש: בילטונג וואסבי",
    "💬 הזמן דרך WhatsApp — מהיר וקל",
    "🚚 משלוח בכל רחבי ישראל",
    "🥃 Shweet Brew Shots — נסה פעם אחת, הזמן לתמיד",
  ];

  const text = messages.join("   •   ");

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] overflow-hidden py-1.5"
      style={{ backgroundColor: "oklch(0.35 0.15 260)", height: "32px" }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: "marquee-bar 35s linear infinite",
        }}
      >
        <span
          className="font-body text-xs font-bold tracking-wide"
          style={{ color: "oklch(0.97 0.005 260)", letterSpacing: "0.05em" }}
        >
          {text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{text}
        </span>
      </div>
      <style>{`
        @keyframes marquee-bar {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
