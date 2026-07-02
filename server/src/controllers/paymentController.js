const crypto = require("crypto");
const User = require("../models/User");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { PLANS, resolveCurrency } = require("../config/pricing");

const RZP_BASE = "https://api.razorpay.com/v1";
const authHeader = () =>
  "Basic " +
  Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString(
    "base64"
  );

// Keep only non-sensitive, masked card metadata - never the full PAN or CVV.
const sanitizeCard = (card = {}) => {
  const digits = String(card.number || "").replace(/\D/g, "");
  return {
    brand: card.brand || "card",
    last4: digits.slice(-4),
    expiry: card.expiry || "",
    name: card.name || "",
  };
};

exports.getConfig = asyncHandler((req, res) =>
  res.json({ keyId: env.RAZORPAY_KEY_ID, plans: PLANS })
);

// Create a real Razorpay order with the test keys. If the currency isn't
// enabled on the account (common for non-INR in test mode), fall back to a
// "demo" response so the checkout still completes via /confirm-demo.
exports.createOrder = asyncHandler(async (req, res) => {
  const currency = resolveCurrency(req.body.currency);
  const plan = PLANS[currency];

  let order = null;
  let demo = false;
  let note = null;

  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      const r = await fetch(`${RZP_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader(),
        },
        body: JSON.stringify({
          amount: plan.amount,
          currency,
          receipt: `mw_${req.user._id}_${Date.now()}`.slice(0, 40),
          notes: { userId: String(req.user._id), plan: "premium" },
        }),
      });
      const data = await r.json();
      if (r.ok && data.id) order = data;
      else {
        demo = true;
        note = data?.error?.description || "Order creation unavailable.";
      }
    } catch (e) {
      demo = true;
      note = "Could not reach Razorpay; using demo mode.";
    }
  } else {
    demo = true;
    note = "Razorpay keys not configured; using demo mode.";
  }

  return res.json({
    keyId: env.RAZORPAY_KEY_ID,
    currency,
    amount: plan.amount,
    display: plan.display,
    orderId: order ? order.id : null,
    demo,
    note,
  });
});

// Verify a real Razorpay Checkout payment (HMAC signature) and grant Premium.
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, card, save } =
    req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  const user = await User.findById(req.user._id);
  user.isPremium = true;
  if (save && card) user.savedCard = sanitizeCard(card);
  await user.save();
  return res.json({ message: "Payment verified", user: user.toJSON() });
});

// Test/demo capture for the custom card / UPI / net-banking flows. No real
// charge is made (raw card collection would require PCI-DSS); this activates
// Premium so the end-to-end UX is demonstrable with the test keys.
exports.confirmDemo = asyncHandler(async (req, res) => {
  const { card, save } = req.body;
  const user = await User.findById(req.user._id);
  user.isPremium = true;
  if (save && card) user.savedCard = sanitizeCard(card);
  await user.save();
  return res.json({ message: "Premium activated", user: user.toJSON() });
});

exports.removeSavedCard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.savedCard = undefined;
  await user.save();
  return res.json({ message: "Saved card removed", user: user.toJSON() });
});

// Cancel the Premium subscription (revert to the Free plan).
exports.cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isPremium = false;
  await user.save();
  return res.json({ message: "Subscription cancelled", user: user.toJSON() });
});
