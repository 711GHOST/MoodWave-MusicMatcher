import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getPaymentConfig,
  createOrder,
  verifyPayment,
  confirmDemo,
} from "../api/payment";
import { detectCurrency, SUPPORTED_CURRENCIES } from "../utils/region";
import CardForm from "../components/payment/CardForm";
import UpiPanel from "../components/payment/UpiPanel";
import NetBankingPanel from "../components/payment/NetBankingPanel";
import Spinner from "../components/shared/Spinner";

const PERKS = [
  "Ad-free listening",
  "Premium profile badge",
  "Unlimited playlists & uploads",
  "Support indie Moodwave",
];
const ZERO_DECIMAL = ["JPY"];

const METHODS = [
  { id: "card", label: "Card", icon: "mdi:credit-card-outline" },
  { id: "upi", label: "UPI", icon: "mdi:cellphone" },
  { id: "netbanking", label: "Net Banking", icon: "mdi:bank-outline" },
];

const Checkout = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [keyId, setKeyId] = useState("");
  const [currency, setCurrency] = useState(() => detectCurrency());
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [method, setMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.isPremium) navigate("/premium", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    getPaymentConfig()
      .then((c) => setKeyId(c.keyId))
      .catch(() => {});
  }, []);

  const loadOrder = useCallback(async (cur) => {
    setLoadingOrder(true);
    try {
      const o = await createOrder(cur);
      setOrder(o);
    } catch (e) {
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  }, []);

  useEffect(() => {
    loadOrder(currency);
  }, [currency, loadOrder]);

  const priceLabel = order?.display || "";
  const majorAmount = order
    ? ZERO_DECIMAL.includes(order.currency)
      ? order.amount
      : order.amount / 100
    : null;

  const onSuccess = async () => {
    await refreshUser();
    toast.success("Welcome to Premium! 🎉");
    navigate("/premium");
  };

  const payCard = async (card, save) => {
    setSubmitting(true);
    try {
      await confirmDemo({ card, save });
      await onSuccess();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const payMethod = async () => {
    setSubmitting(true);
    try {
      await confirmDemo({});
      await onSuccess();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Real Razorpay hosted checkout (works for orders the test account supports).
  const openRazorpay = () => {
    if (!window.Razorpay) {
      toast.error("Razorpay couldn't load. Check your connection.");
      return;
    }
    if (!order?.orderId) {
      toast.info(
        "Secure hosted checkout needs a test order in this currency - use a method above, or switch to ₹ INR."
      );
      return;
    }
    const rzp = new window.Razorpay({
      key: keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "Moodwave",
      description: "Premium subscription",
      prefill: {
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email,
      },
      theme: { color: "#1ed760" },
      handler: async (resp) => {
        setSubmitting(true);
        try {
          await verifyPayment({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          await onSuccess();
        } catch (e) {
          toast.error(e.message);
        } finally {
          setSubmitting(false);
        }
      },
      modal: { ondismiss: () => setSubmitting(false) },
    });
    rzp.open();
  };

  return (
    <div className="pt-8 max-w-5xl mx-auto pb-16">
      <button
        onClick={() => navigate("/premium")}
        className="flex items-center gap-1 text-sm text-ink-400 hover:text-white mb-4"
      >
        <Icon icon="mdi:chevron-left" width={20} /> Back
      </button>

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
        {/* Plan summary + region pricing */}
        <div className="bg-gradient-to-br from-brand/15 to-accent/10 border border-brand/30 rounded-2xl p-6 h-fit">
          <div className="inline-flex items-center gap-2 bg-brand/15 text-brand text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Icon icon="mdi:crown" width={16} /> MOODWAVE PREMIUM
          </div>
          <div className="flex items-end gap-2">
            {loadingOrder ? (
              <Spinner size={28} />
            ) : (
              <span className="text-4xl font-extrabold text-white">{priceLabel}</span>
            )}
            <span className="text-ink-400 mb-1">/ month</span>
          </div>

          <div className="mt-4">
            <label className="text-xs text-ink-400 mb-1 block">
              Billing region
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-700 text-white text-sm focus:outline-none focus:border-brand"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-ink-800">
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-ink-500 mt-1">
              Priced automatically for your region - change it above.
            </p>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-white">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Icon icon="mdi:check-circle" width={18} className="text-brand" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment methods */}
        <div className="bg-ink-850 border border-ink-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Pay with</h2>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-semibold transition ${
                  method === m.id
                    ? "border-brand bg-brand/10 text-white"
                    : "border-ink-700 text-ink-400 hover:text-white hover:border-ink-500"
                }`}
              >
                <Icon icon={m.icon} width={24} />
                {m.label}
              </button>
            ))}
          </div>

          {method === "card" && (
            <CardForm
              priceLabel={priceLabel}
              onPay={payCard}
              submitting={submitting}
            />
          )}
          {method === "upi" && (
            <UpiPanel
              priceLabel={priceLabel}
              amountMajor={majorAmount}
              onPay={payMethod}
              submitting={submitting}
            />
          )}
          {method === "netbanking" && (
            <NetBankingPanel
              priceLabel={priceLabel}
              onPay={payMethod}
              submitting={submitting}
            />
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-ink-800" />
            <span className="text-xs text-ink-500">or</span>
            <div className="flex-1 border-t border-ink-800" />
          </div>

          <button
            onClick={openRazorpay}
            disabled={submitting || loadingOrder}
            className="w-full flex items-center justify-center gap-2 border border-ink-600 hover:border-white text-white font-bold py-3 rounded-full transition disabled:opacity-50"
          >
            <Icon icon="mdi:shield-check" width={18} /> Pay securely with Razorpay
          </button>

          <p className="text-[11px] text-ink-500 mt-3 text-center">
            Test mode - use Razorpay test credentials. Cards are validated locally
            and never stored in full.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
