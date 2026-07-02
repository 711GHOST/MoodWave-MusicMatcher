import { useState } from "react";
import { Icon } from "@iconify/react";
import Spinner from "../shared/Spinner";
import CardBrandBadge from "./CardBrandBadge";
import CardScanner from "./CardScanner";
import {
  detectBrand,
  formatCardNumber,
  luhnValid,
  cvvLength,
} from "../../utils/cardBrand";

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

const CardForm = ({ priceLabel, onPay, submitting }) => {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [save, setSave] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const brand = detectBrand(number);
  const digits = number.replace(/\D/g, "");
  const numberValid = luhnValid(digits);
  const cvvOk = cvv.length === cvvLength(brand);
  const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
  const canPay = numberValid && cvvOk && expiryOk && name.trim().length > 1;

  const onScanned = ({ number: scannedNum, expiry: scannedExp }) => {
    const b = detectBrand(scannedNum);
    setNumber(formatCardNumber(scannedNum, b));
    if (scannedExp) setExpiry(scannedExp);
  };

  const pay = () => {
    if (!canPay) return;
    onPay({ number: digits, expiry, name: name.trim(), brand: brand || "card" }, save);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Card details</span>
        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
        >
          <Icon icon="mdi:camera-outline" width={16} /> Scan card
        </button>
      </div>

      {/* Card number with live brand badge */}
      <div>
        <label className="text-xs text-ink-400 mb-1 block">Card number</label>
        <div className="relative">
          <input
            inputMode="numeric"
            value={number}
            onChange={(e) =>
              setNumber(formatCardNumber(e.target.value, detectBrand(e.target.value)))
            }
            placeholder="1234 5678 9012 3456"
            className={`w-full pl-4 pr-24 py-3 rounded-lg bg-ink-800 border text-white placeholder-ink-600 focus:outline-none transition ${
              number && !numberValid
                ? "border-red-500/60"
                : "border-ink-700 focus:border-brand"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {number && numberValid && (
              <Icon icon="mdi:check-circle" width={18} className="text-brand" />
            )}
            {brand ? (
              <CardBrandBadge brand={brand} />
            ) : (
              <Icon icon="mdi:credit-card-outline" width={22} className="text-ink-500" />
            )}
          </div>
        </div>
        {number && !numberValid && (
          <p className="text-xs text-red-400 mt-1">
            That card number doesn't look valid.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-ink-400 mb-1 block">Expiry (MM/YY)</label>
          <input
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="08/27"
            className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-600 focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-ink-400 mb-1 block">
            CVV{" "}
            <span className="text-ink-600">(entered manually)</span>
          </label>
          <input
            inputMode="numeric"
            type="password"
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, "").slice(0, cvvLength(brand)))
            }
            placeholder={brand === "amex" ? "1234" : "123"}
            className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-600 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink-400 mb-1 block">Name on card</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="JANE DOE"
          className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-600 focus:outline-none focus:border-brand uppercase"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={save}
          onChange={(e) => setSave(e.target.checked)}
          className="w-4 h-4 accent-brand"
        />
        <span className="text-sm text-ink-300">
          Save this card for next time{" "}
          <span className="text-ink-500">(optional - only the last 4 digits are stored)</span>
        </span>
      </label>

      <button
        onClick={pay}
        disabled={!canPay || submitting}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-50"
      >
        {submitting ? (
          <Spinner size={20} className="text-black" />
        ) : (
          <>
            <Icon icon="mdi:lock" width={18} /> Pay {priceLabel}
          </>
        )}
      </button>

      {scannerOpen && (
        <CardScanner
          onScanned={onScanned}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default CardForm;
