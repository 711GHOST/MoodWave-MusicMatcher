import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getPaymentConfig, removeSavedCard, cancelSubscription } from "../api/payment";
import { detectCurrency } from "../utils/region";
import { BRAND_INFO } from "../utils/cardBrand";
import Spinner from "../components/shared/Spinner";

const PERKS = [
  "Ad-free listening",
  "Premium profile badge",
  "Unlimited playlists & uploads",
  "Support indie Moodwave",
];

const Li = ({ children, muted }) => (
  <li className={`flex items-center gap-2 ${muted ? "text-ink-500" : ""}`}>
    <Icon
      icon={muted ? "mdi:close-circle" : "mdi:check-circle"}
      width={18}
      className={muted ? "text-ink-600" : "text-brand"}
    />
    {children}
  </li>
);

const Premium = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [price, setPrice] = useState("");
  const [removing, setRemoving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getPaymentConfig()
      .then((c) => {
        const cur = detectCurrency();
        setPrice(c.plans?.[cur]?.display || c.plans?.USD?.display || "$4.99");
      })
      .catch(() => setPrice("$4.99"));
  }, []);

  const dropCard = async () => {
    setRemoving(true);
    try {
      await removeSavedCard();
      await refreshUser();
      toast.success("Saved card removed.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRemoving(false);
    }
  };

  const cancelPremium = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      await refreshUser();
      toast.success("Your Premium subscription has been cancelled.");
      setConfirmCancel(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (user?.isPremium) {
    const card = user.savedCard;
    return (
      <div className="pt-10 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-xl mb-5">
          <Icon icon="mdi:crown" width={44} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">You're Premium ✨</h1>
        <p className="text-ink-400 mt-2">
          Thanks for supporting Moodwave. Enjoy ad-free listening and your
          profile badge.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
          {PERKS.map((p) => (
            <div
              key={p}
              className="flex items-center gap-3 bg-ink-800 rounded-xl p-4"
            >
              <Icon icon="mdi:check-circle" className="text-brand" width={22} />
              <span className="text-white text-sm font-medium">{p}</span>
            </div>
          ))}
        </div>

        {card && card.last4 && (
          <div className="mt-6 flex items-center justify-between bg-ink-850 border border-ink-800 rounded-xl p-4 text-left">
            <div className="flex items-center gap-3">
              <span
                className="px-2 py-0.5 rounded text-[11px] font-extrabold text-white"
                style={{ backgroundColor: BRAND_INFO[card.brand]?.color || "#555" }}
              >
                {BRAND_INFO[card.brand]?.label || "CARD"}
              </span>
              <div>
                <div className="text-white text-sm font-semibold">
                  •••• •••• •••• {card.last4}
                </div>
                <div className="text-xs text-ink-500">
                  {card.name} · expires {card.expiry}
                </div>
              </div>
            </div>
            <button
              onClick={dropCard}
              disabled={removing}
              className="text-sm font-semibold text-ink-400 hover:text-red-400 transition disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-ink-800">
          {confirmCancel ? (
            <div className="bg-ink-850 border border-ink-800 rounded-xl p-4 text-left">
              <div className="text-sm text-white font-semibold">
                Cancel your Premium subscription?
              </div>
              <p className="text-xs text-ink-400 mt-1">
                You'll go back to the Free plan and lose ad-free listening and your
                badge. You can re-subscribe anytime.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={cancelPremium}
                  disabled={cancelling}
                  className="flex items-center gap-2 bg-red-500/90 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-full transition disabled:opacity-60"
                >
                  {cancelling ? (
                    <Spinner size={16} className="text-white" />
                  ) : (
                    "Yes, cancel Premium"
                  )}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                  className="text-sm font-semibold text-ink-400 hover:text-white px-3"
                >
                  Keep Premium
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-sm font-semibold text-ink-500 hover:text-red-400 transition"
            >
              Cancel Premium subscription
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-brand/15 text-brand text-xs font-bold px-3 py-1 rounded-full mb-3">
          <Icon icon="mdi:crown" width={16} /> MOODWAVE PREMIUM
        </div>
        <h1 className="text-4xl font-extrabold text-white">Listen without limits</h1>
        <p className="text-ink-400 mt-2">
          Upgrade for an ad-free experience and a few extra perks.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-ink-850 border border-ink-800 rounded-2xl p-7">
          <div className="text-sm text-ink-400 font-semibold">Free</div>
          <div className="text-3xl font-extrabold text-white mt-1">
            0<span className="text-base font-medium text-ink-500">/mo</span>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-ink-300">
            <Li>Stream the full catalog</Li>
            <Li>Mood detection</Li>
            <Li>Create playlists</Li>
            <Li muted>Contains ads</Li>
          </ul>
          <div className="mt-6 text-center text-ink-500 text-sm font-semibold border border-ink-700 rounded-full py-3">
            Your current plan
          </div>
        </div>

        {/* Premium */}
        <div className="relative bg-gradient-to-br from-brand/15 to-accent/10 border border-brand/40 rounded-2xl p-7">
          <div className="absolute top-4 right-4 text-[10px] font-bold bg-brand text-black px-2 py-0.5 rounded-full">
            BEST VALUE
          </div>
          <div className="text-sm text-brand font-semibold">Premium</div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {price || "…"}
            <span className="text-base font-medium text-ink-500">/mo</span>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-white">
            {PERKS.map((p) => (
              <Li key={p}>{p}</Li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full bg-brand hover:bg-brand-light text-black font-bold py-3 rounded-full transition flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:crown" width={20} /> Go Premium
          </button>
          <div className="text-center text-[11px] text-ink-500 mt-2">
            UPI, cards & net banking · powered by Razorpay (test mode)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
