// Card brand detection (by IIN/prefix), Luhn validation and formatting.
const BRANDS = [
  { brand: "visa", label: "VISA", color: "#1A1F71", test: (n) => /^4/.test(n) },
  {
    brand: "mastercard",
    label: "Mastercard",
    color: "#EB001B",
    test: (n) => /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n),
  },
  { brand: "amex", label: "AMEX", color: "#2E77BC", test: (n) => /^3[47]/.test(n) },
  {
    brand: "diners",
    label: "Diners",
    color: "#0079BE",
    test: (n) => /^(36|38|30[0-5])/.test(n),
  },
  { brand: "jcb", label: "JCB", color: "#0B4EA2", test: (n) => /^35/.test(n) },
  // Discover's specific prefixes are matched before RuPay's broader ranges
  // (the two share parts of the 60–65 space).
  {
    brand: "discover",
    label: "Discover",
    color: "#FF6000",
    test: (n) => /^(6011|64[4-9])/.test(n),
  },
  {
    brand: "rupay",
    label: "RuPay",
    color: "#097969",
    test: (n) => /^(60|65|81|82|508)/.test(n),
  },
];

export const BRAND_INFO = BRANDS.reduce((acc, b) => {
  acc[b.brand] = { label: b.label, color: b.color };
  return acc;
}, {});

export const detectBrand = (number) => {
  const n = String(number || "").replace(/\D/g, "");
  if (!n) return null;
  const match = BRANDS.find((b) => b.test(n));
  return match ? match.brand : null;
};

// Amex numbers are 15 digits (4-6-5); most others are 16 (some up to 19).
export const maxDigits = (brand) => (brand === "amex" ? 15 : 16);
export const cvvLength = (brand) => (brand === "amex" ? 4 : 3);

export const formatCardNumber = (number, brand) => {
  const n = String(number || "")
    .replace(/\D/g, "")
    .slice(0, maxDigits(brand));
  if (brand === "amex") {
    return n.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );
  }
  return n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

// Standard Luhn checksum.
export const luhnValid = (number) => {
  const n = String(number || "").replace(/\D/g, "");
  if (n.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = parseInt(n[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
};
