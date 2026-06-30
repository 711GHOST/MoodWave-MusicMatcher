// Premium pricing per currency. `amount` is in the smallest currency subunit
// expected by Razorpay (paise/cents); zero-decimal currencies (JPY) use the
// major unit directly. `display` is what the UI shows.
const PLANS = {
  INR: { currency: "INR", amount: 11900, display: "₹119", symbol: "₹" },
  USD: { currency: "USD", amount: 499, display: "$4.99", symbol: "$" },
  GBP: { currency: "GBP", amount: 399, display: "£3.99", symbol: "£" },
  EUR: { currency: "EUR", amount: 449, display: "€4.49", symbol: "€" },
  JPY: { currency: "JPY", amount: 600, display: "¥600", symbol: "¥" },
  AUD: { currency: "AUD", amount: 749, display: "A$7.49", symbol: "A$" },
  CAD: { currency: "CAD", amount: 699, display: "C$6.99", symbol: "C$" },
  SGD: { currency: "SGD", amount: 699, display: "S$6.99", symbol: "S$" },
  AED: { currency: "AED", amount: 1800, display: "AED 18", symbol: "د.إ" },
};

const DEFAULT_CURRENCY = "USD";

const resolveCurrency = (c) => {
  const up = String(c || "").toUpperCase();
  return PLANS[up] ? up : DEFAULT_CURRENCY;
};

module.exports = { PLANS, DEFAULT_CURRENCY, resolveCurrency };
