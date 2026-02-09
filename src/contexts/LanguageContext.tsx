import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, languageNames, translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
  languageNames: typeof languageNames;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect browser language and map to supported language
function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "ja";
  
  const browserLang = navigator.language || (navigator as any).userLanguage || "ja";
  const langCode = browserLang.split("-")[0].toLowerCase();
  
  const langMap: Record<string, Language> = {
    ja: "ja",
    en: "en",
    zh: "zh",
    ko: "ko",
    es: "es",
    fr: "fr",
  };
  
  return langMap[langCode] || "en"; // Default to English for unsupported languages
}

// Get saved language from localStorage
function getSavedLanguage(): Language | null {
  if (typeof localStorage === "undefined") return null;
  const saved = localStorage.getItem("six-oracle-language");
  if (saved && ["ja", "en", "zh", "ko", "es", "fr"].includes(saved)) {
    return saved as Language;
  }
  return null;
}

// Save language to localStorage
function saveLanguage(lang: Language): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("six-oracle-language", lang);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Priority: 1. Saved preference, 2. Browser language, 3. Japanese
    return getSavedLanguage() || detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  // Translation function
  const t = (section: string, key: string): string => {
    try {
      const sectionData = (translations as any)[section];
      if (!sectionData) return key;
      
      const item = sectionData[key];
      if (!item) return key;
      
      if (typeof item === "object" && item !== null && language in item) {
        return item[language];
      }
      
      return String(item);
    } catch {
      return key;
    }
  };

  const availableLanguages: Language[] = ["ja", "en", "zh", "ko", "es", "fr"];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageNames,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
