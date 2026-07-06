import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/config/languages";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHebrew: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage on mount, default to English
  useEffect(() => {
    const saved = localStorage.getItem("shweet-brew-language") as Language | null;
    if (saved && (saved === "en" || saved === "he")) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "he" ? "rtl" : "ltr";
    } else {
      // Default to English
      setLanguageState("en");
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  }, []);

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
