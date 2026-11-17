import { Home } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const he = language === "he";

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center px-4 pt-32 pb-20"
      style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
    >
      <div
        className="w-full max-w-lg p-8 md:p-12 rounded-lg text-center shadow-lg"
        style={{ backgroundColor: "var(--card)", borderLeft: "4px solid var(--accent)" }}
      >
        <p className="section-eyebrow mb-3">— {he ? "אופס" : "Oops"} —</p>
        <h1
          className="font-display leading-none mb-2"
          style={{ fontSize: "clamp(5rem, 15vw, 8rem)", color: "var(--accent)" }}
        >
          404
        </h1>
        <h2 className="font-display text-3xl mb-4" style={{ color: "oklch(0.94 0.025 75)" }}>
          {he ? "הדף לא נמצא" : "Page Not Found"}
        </h2>
        <p className="font-body mb-8 leading-relaxed" style={{ color: "oklch(0.80 0.020 75)" }}>
          {he
            ? "הדף שחיפשת לא קיים. אולי הוא הועבר או נמחק."
            : "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted."}
        </p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded font-body font-bold text-sm tracking-wide transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "oklch(0.94 0.025 75)" }}
        >
          <Home className="w-4 h-4" />
          {he ? "חזרה לדף הבית" : "Go Home"}
        </button>
      </div>
    </section>
  );
}
