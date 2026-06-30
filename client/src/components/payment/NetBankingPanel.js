import { useState } from "react";
import { Icon } from "@iconify/react";
import Spinner from "../shared/Spinner";

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Yes Bank",
  "IDFC FIRST Bank",
];

const NetBankingPanel = ({ priceLabel, onPay, submitting }) => {
  const [bank, setBank] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs text-ink-400 mb-1 block">Choose your bank</label>
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white focus:outline-none focus:border-brand"
        >
          <option value="">Select a bank…</option>
          {BANKS.map((b) => (
            <option key={b} value={b} className="bg-ink-800">
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-500">
        <Icon icon="mdi:bank-outline" width={14} />
        You'll be redirected to your bank to authorise the payment.
      </div>

      <button
        onClick={() => onPay({ method: "netbanking", bank })}
        disabled={submitting || !bank}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-50"
      >
        {submitting ? (
          <Spinner size={20} className="text-black" />
        ) : (
          <>
            <Icon icon="mdi:bank" width={18} /> Pay {priceLabel}
          </>
        )}
      </button>
    </div>
  );
};

export default NetBankingPanel;
