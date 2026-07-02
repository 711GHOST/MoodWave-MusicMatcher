// Maps our human-readable language names (as shown in LanguageModal) to the
// language codes the Google Website Translate widget expects. The widget uses a
// handful of legacy codes (e.g. "iw" for Hebrew, "tl" for Filipino) and region
// variants ("zh-CN"/"zh-TW", "pt-PT"). English is the page's source language,
// so selecting it means "no translation".
const GOOGLE_LANG_CODES = {
  English: "en",
  Hindi: "hi",
  "European Spanish": "es",
  "Latin American Spanish": "es",
  French: "fr",
  German: "de",
  Italian: "it",
  "Brazilian Portuguese": "pt",
  "European Portuguese": "pt-PT",
  Dutch: "nl",
  Polish: "pl",
  Russian: "ru",
  Turkish: "tr",
  Arabic: "ar",
  Bengali: "bn",
  Gujarati: "gu",
  Kannada: "kn",
  Malayalam: "ml",
  Marathi: "mr",
  Punjabi: "pa",
  Tamil: "ta",
  Telugu: "te",
  Urdu: "ur",
  Japanese: "ja",
  Korean: "ko",
  "Simplified Chinese": "zh-CN",
  "Traditional Chinese": "zh-TW",
  Indonesian: "id",
  Vietnamese: "vi",
  Thai: "th",
  Swedish: "sv",
  Norwegian: "no",
  Danish: "da",
  Finnish: "fi",
  Greek: "el",
  Czech: "cs",
  Hungarian: "hu",
  Romanian: "ro",
  Ukrainian: "uk",
  Hebrew: "iw",
  Filipino: "tl",
  Swahili: "sw",
  Zulu: "zu",
};

export const googleCodeFor = (name) => GOOGLE_LANG_CODES[name] || "en";

export default GOOGLE_LANG_CODES;
