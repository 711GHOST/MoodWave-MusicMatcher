import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import strings, { RTL_LANGUAGES } from "../i18n/strings";

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

  // Flip text direction for right-to-left languages.
  useEffect(() => {
    const rtl = RTL_LANGUAGES.has(language);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
    return () => {
      document.documentElement.dir = "ltr";
    };
  }, [language]);

  // Translate a key, falling back to English then to the raw key.
  const t = useCallback(
    (key) =>
      (strings[language] && strings[language][key]) ||
      strings.English[key] ||
      key,
    [language]
  );

  const isRTL = RTL_LANGUAGES.has(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
