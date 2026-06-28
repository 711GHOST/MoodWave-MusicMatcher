import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "../components/shared/Modal";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

// Display name -> native label.
const LANGUAGES = {
  English: "English",
  Hindi: "हिन्दी",
  "European Spanish": "Español de España",
  "Latin American Spanish": "Español de Latinoamérica",
  French: "Français",
  German: "Deutsch",
  Italian: "Italiano",
  "Brazilian Portuguese": "Português do Brasil",
  "European Portuguese": "Português",
  Dutch: "Nederlands",
  Polish: "Polski",
  Russian: "Русский",
  Turkish: "Türkçe",
  Arabic: "العَرَبِيَّة",
  Bengali: "বাংলা",
  Gujarati: "ગુજરાતી",
  Kannada: "ಕನ್ನಡ",
  Malayalam: "മലയാളം",
  Marathi: "मराठी",
  Punjabi: "ਪੰਜਾਬੀ",
  Tamil: "தமிழ்",
  Telugu: "తెలుగు",
  Urdu: "اردو",
  Japanese: "日本語",
  Korean: "한국어",
  "Simplified Chinese": "简体中文",
  "Traditional Chinese": "中文",
  Indonesian: "Bahasa Indonesia",
  Vietnamese: "Tiếng Việt",
  Thai: "ภาษาไทย",
  Swedish: "Svenska",
  Norwegian: "Norsk",
  Danish: "Dansk",
  Finnish: "Suomeksi",
  Greek: "Eλληνικά",
  Czech: "Čeština",
  Hungarian: "Magyar",
  Romanian: "Română",
  Ukrainian: "Українська",
  Hebrew: "עברית",
  Filipino: "Filipino",
  Swahili: "Kiswahili",
  Zulu: "IsiZulu",
};

const LanguageModal = ({ onClose }) => {
  const { language, setLanguage } = useLanguage();
  const toast = useToast();
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(LANGUAGES).filter(
      ([name, native]) =>
        !q ||
        name.toLowerCase().includes(q) ||
        native.toLowerCase().includes(q)
    );
  }, [query]);

  const choose = (name) => {
    setLanguage(name);
    toast.success(`Language set to ${name}`);
    onClose();
  };

  return (
    <Modal
      title="Choose a language"
      subtitle="Updates the labels you see across Moodwave."
      onClose={onClose}
      widthClass="w-full max-w-2xl"
    >
      <div className="relative mb-4">
        <Icon
          icon="mdi:magnify"
          width={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-500 focus:outline-none focus:border-brand"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-auto pr-1">
        {entries.map(([name, native]) => {
          const active = name === language;
          return (
            <button
              key={name}
              onClick={() => choose(name)}
              className={`flex flex-col items-start p-3 rounded-lg text-left transition border ${
                active
                  ? "border-brand bg-brand/10"
                  : "border-transparent hover:bg-ink-700"
              }`}
            >
              <span className="text-sm text-white font-semibold">{native}</span>
              <span className="text-xs text-ink-500">{name}</span>
            </button>
          );
        })}
        {entries.length === 0 && (
          <div className="col-span-full text-center text-ink-500 text-sm py-8">
            No languages match “{query}”.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LanguageModal;
