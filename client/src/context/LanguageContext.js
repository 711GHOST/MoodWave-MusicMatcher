import { createContext, useCallback, useContext, useState } from "react";
import strings from "../i18n/strings";

const LanguageContext = createContext(null);
const STORAGE_KEY = "mw_language";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "English"
  );

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  // Translate a key, falling back to English then to the raw key.
  const t = useCallback(
    (key) =>
      (strings[language] && strings[language][key]) ||
      strings.English[key] ||
      key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
