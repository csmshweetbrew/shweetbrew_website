import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/config/languages";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHebrew: boolean;
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
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("shweet-brew-language", lang);
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
