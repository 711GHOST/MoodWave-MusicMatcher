import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@iconify/react";
import Spinner from "../shared/Spinner";

// UPI payment panel: a scannable (demo) QR plus a UPI-ID option.
const UpiPanel = ({ priceLabel, amountMajor, onPay, submitting }) => {
  const [qr, setQr] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const uri = `upi://pay?pa=moodwave@razorpay&pn=Moodwave&am=${
      amountMajor || ""
    }&cu=INR&tn=${encodeURIComponent("Moodwave Premium")}`;
    QRCode.toDataURL(uri, { width: 220, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [amountMajor]);

  const upiOk = /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 bg-ink-800 rounded-2xl p-6">
        <p className="text-sm text-ink-300">Scan with any UPI app to pay</p>
        {qr ? (
          <img
            src={qr}
            alt="UPI QR code"
            className="w-44 h-44 rounded-lg bg-white p-2"
          />
        ) : (
          <div className="w-44 h-44 rounded-lg bg-ink-700 flex items-center justify-center">
            <Spinner size={28} />
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Icon icon="mdi:information-outline" width={14} />
          Demo QR for test mode — no real money moves.
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-ink-800" />
        <span className="text-xs text-ink-500">or pay by UPI ID</span>
        <div className="flex-1 border-t border-ink-800" />
      </div>

      <div>
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@bank"
          className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-600 focus:outline-none focus:border-brand"
        />
      </div>

      <button
        onClick={() => onPay({ method: "upi", upiId })}
        disabled={submitting || (!upiOk && !qr)}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition disabled:opacity-50"
      >
        {submitting ? (
          <Spinner size={20} className="text-black" />
        ) : (
          <>
            <Icon icon="mdi:cellphone-check" width={18} /> Verify & Pay {priceLabel}
          </>
        )}
      </button>
    </div>
  );
};

export default UpiPanel;
