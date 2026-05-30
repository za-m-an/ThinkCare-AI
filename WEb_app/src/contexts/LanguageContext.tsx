"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Language } from "@/lib/translations";

// ─────────────────────────────────────────────────
// Language Context — provides global language state
// and a t() helper for looking up translated strings
// ─────────────────────────────────────────────────

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

const STORAGE_KEY = "thinkcare_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "bn") {
        setLanguageState(stored);
      }
    } catch {
      // localStorage not available (e.g. SSR)
    }
  }, []);

  // Persist to localStorage on change
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // noop
    }
  }, []);

  // Translation lookup: t("chat", "headerTitle") → "Medical Assistant" | "চিকিৎসা সহকারী"
  const t = useCallback(
    (section: string, key: string): string => {
      const sectionData = translations[section];
      if (!sectionData) {
        console.warn(`[i18n] Missing section: "${section}"`);
        return key;
      }
      const entry = sectionData[key];
      if (!entry) {
        console.warn(`[i18n] Missing key: "${section}.${key}"`);
        return key;
      }
      return entry[language] || entry["en"] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Convenience hook
export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
