import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/config/languages";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHebrew: boolean;
};

const TITLE = { en: "Shweet Brew: Biltong, Boerewors & Braai Culture in Israel", he: "שוויט ברו: בילטונג, בוארווורס ותרבות הברייי בישראל" };
const DESCRIPTION = {
  en: "South African biltong, boerewors and drywors, American-style jerky and sauces. Made in Modiin, delivered across Israel.",
  he: "בילטונג, בוארווורס ודרייוורס דרום אפריקאיים, ג'רקי בסגנון אמריקאי ורטבים. מיוצרים במודיעין ונשלחים לכל הארץ.",
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Read the saved language synchronously so the first render is already in the right
  // language (index.html sets lang/dir before paint too), instead of rendering English
  // and then switching.
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("shweet-brew-language");
      return saved === "he" ? "he" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.title = TITLE[language];
    document.querySelector('meta[name="description"]')?.setAttribute("content", DESCRIPTION[language]);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem("shweet-brew-language", lang); } catch { /* private window: just for this visit */ }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isHebrew: language === "he",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
