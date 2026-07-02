import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import strings, { RTL_LANGUAGES } from "../i18n/strings";
import { googleCodeFor } from "../i18n/googleLanguages";

const LanguageContext = createContext(null);
const STORAGE_KEY = "mw_language";

// --- Google Website Translate widget --------------------------------------
// We drive Google's whole-page translator from our own language picker: pick a
// language -> set the `googtrans` cookie -> reload, and the widget re-translates
// the entire DOM (every page, including dynamic content) into that language on
// load. Selecting English clears the cookie so the original source text shows.

function setGoogTransCookie(code) {
  const host = window.location.hostname;
  const value = `/en/${code}`;
  // Set on the bare path plus host/dot-host variants so it sticks on both
  // localhost and a real (sub)domain.
  ["", `;domain=${host}`, `;domain=.${host}`].forEach((scope) => {
    document.cookie = `googtrans=${value};path=/${scope}`;
  });
}

function clearGoogTransCookie() {
  const host = window.location.hostname;
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  ["", `;domain=${host}`, `;domain=.${host}`].forEach((scope) => {
    document.cookie = `googtrans=;path=/${scope};${expired}`;
  });
}

// Inject the widget script exactly once. The widget reads the `googtrans`
// cookie on init and applies the translation automatically.
function loadGoogleWidget() {
  if (window.__mwGoogleWidgetLoaded) return;
  window.__mwGoogleWidgetLoaded = true;
  window.googleTranslateElementInit = () => {
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement(
      { pageLanguage: "en", autoDisplay: false },
      "google_translate_element"
    );
  };
  const script = document.createElement("script");
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "English"
  );

  // Mount the (visually hidden) Google translate widget once.
  useEffect(() => {
    loadGoogleWidget();
  }, []);

  const setLanguage = useCallback((lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
    const code = googleCodeFor(lang);
    if (code === "en") clearGoogTransCookie();
    else setGoogTransCookie(code);
    // Reload so the widget re-translates the whole page consistently.
    window.location.reload();
  }, []);

  // Flip text direction for right-to-left languages.
  useEffect(() => {
    const rtl = RTL_LANGUAGES.has(language);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // The page is authored in English; Google translates the rendered DOM into
  // the chosen language, so t() simply returns the English source copy.
  const t = useCallback((key) => strings.English[key] || key, []);

  const isRTL = RTL_LANGUAGES.has(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div
        id="google_translate_element"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
