/* One legal page (config/legal.ts): a title and short sections. Gaps show as marked text on the dev server. */

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LegalPage } from "@/config/legal";

export default function Legal({ page }: { page: LegalPage }) {
  const { language } = useLanguage();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page.path]);

  return (
    <main className="container legal-page">
      <Link href="/" className="legal-back">
        <ArrowRight className="w-5 h-5 rotate-180 rtl:rotate-0" aria-hidden="true" />
        {language === "he" ? "חזרה לחנות" : "Back to the shop"}
      </Link>
      <h1 className="section-title">{page.title[language]}</h1>
      {page.sections.map((s) => (
        <section key={s.title.en}>
          <h2>{s.title[language]}</h2>
          <p>
            {s.text[language].split(/(\[\[.*?\]\])/).map((part, i) => (part.startsWith("[[") ? <mark key={i}>{part.slice(2, -2)}</mark> : part))}
          </p>
        </section>
      ))}
    </main>
  );
}
