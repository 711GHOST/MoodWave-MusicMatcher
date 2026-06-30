// Best-effort currency detection from the browser locale, with a manual
// override available in the UI. Maps a country (region) code to a currency we
// price Premium in.
const COUNTRY_TO_CURRENCY = {
  US: "USD",
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  IN: "INR",
  JP: "JPY",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  AE: "AED",
};

export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "United States ($)" },
  { code: "INR", label: "India (₹)" },
  { code: "GBP", label: "United Kingdom (£)" },
  { code: "EUR", label: "Eurozone (€)" },
  { code: "JPY", label: "Japan (¥)" },
  { code: "AUD", label: "Australia (A$)" },
  { code: "CAD", label: "Canada (C$)" },
  { code: "SGD", label: "Singapore (S$)" },
  { code: "AED", label: "UAE (د.إ)" },
];

// Resolve the region code from the most reliable signals the browser exposes.
const detectCountry = () => {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || "";
    const fromLocale = loc.split("-")[1];
    if (fromLocale) return fromLocale.toUpperCase();
  } catch {
    /* ignore */
  }
  const lang = (navigator.language || "").split("-")[1];
  return lang ? lang.toUpperCase() : "";
};

export const detectCurrency = () => {
  const country = detectCountry();
  return COUNTRY_TO_CURRENCY[country] || "USD";
};
