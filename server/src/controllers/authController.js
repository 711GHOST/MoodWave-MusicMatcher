const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");
const { sendEmailOtp, sendSmsOtp } = require("../services/notify");

// The demo account can't receive real SMS/email, so it keeps the on-screen code
// hint for anyone trying the app. Real users always get their code delivered for
// real (Resend/Twilio) and never see it echoed back. Tests also need the code
// echoed since notify.js no-ops there.
const DEMO_EMAIL = "demo@moodwave.app";
const exposeCode = (code, email) =>
  env.NODE_ENV === "test" || email === DEMO_EMAIL ? code : undefined;
// Seconds a user must wait between code requests.
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const cooldownRemaining = (otp) => {
  if (!otp || !otp.lastSentAt) return 0;
  const elapsed = Date.now() - new Date(otp.lastSentAt).getTime();
  return Math.max(0, Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000));
};

const TOKEN_COOKIE = "token";
// httpOnly so the JWT is never exposed to JavaScript (XSS-resistant).
// In production the client and API live on different (sub)domains, so the auth
// cookie must be SameSite=None to be sent on cross-site requests - and browsers
// only accept SameSite=None when the cookie is also Secure (HTTPS). Locally we
// stay on SameSite=Lax over http so dev works without TLS.
const cookieOptions = () => {
  const crossSite = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN
    path: "/",
  };
};

// Issue the JWT as an httpOnly cookie. The token is also returned in the body
// for non-browser clients (and the existing test suite).
const issueToken = (res, user) => {
  const token = signToken(user);
  res.cookie(TOKEN_COOKIE, token, cookieOptions());
  return token;
};

exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, userName, password } = req.body;

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { userName }],
  });
  if (existing) {
    const field =
      existing.email === email.toLowerCase() ? "email" : "username";
    return res
      .status(409)
      .json({ error: `An account with this ${field} already exists` });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email,
    userName,
    password: hashedPassword,
  });

  const token = issueToken(res, user);
  // isNewUser drives the first-time welcome modal on the client.
  return res.status(201).json({ user: user.toJSON(), token, isNewUser: true });
});

exports.login = asyncHandler(async (req, res) => {
  // Accept either an email or a username via `identifier` (email also accepted).
  const identifier = (req.body.identifier || req.body.email || "").trim();
  const { password } = req.body;

  if (!identifier || !password) {
    return res
      .status(422)
      .json({ error: "Please provide your credentials and password" });
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { userName: identifier }],
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = issueToken(res, user);
  return res.status(200).json({ user: user.toJSON(), token });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined });
  return res.status(200).json({ message: "Logged out" });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("likedSongs");
  return res.status(200).json({ user: user.toJSON() });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;

  if (email !== undefined) {
    const normalized = email.toLowerCase().trim();
    if (normalized !== user.email) {
      const taken = await User.findOne({
        email: normalized,
        _id: { $ne: user._id },
      });
      if (taken) {
        return res
          .status(409)
          .json({ error: "An account with this email already exists" });
      }
      user.email = normalized;
      // A new address must be re-verified.
      user.emailVerified = false;
    }
  }

  if (phone !== undefined) {
    const trimmed = phone.trim();
    if (trimmed !== user.phone) {
      user.phone = trimmed;
      user.phoneVerified = false;
    }
  }

  await user.save();
  return res.status(200).json({ user: user.toJSON() });
});

// --- One-time passcode (OTP) verification for email / phone ---------------
// Codes are delivered for real via Resend (email) / Twilio (SMS). Outside
// production we also echo the code as `devCode` so local testing works even
// when real delivery is limited (e.g. Resend needs a verified domain).
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

exports.sendOtp = asyncHandler(async (req, res) => {
  const channel = req.body.channel === "phone" ? "phone" : "email";
  const user = await User.findById(req.user._id).select("+otp");

  const target = channel === "phone" ? user.phone : user.email;
  if (!target) {
    return res.status(422).json({
      error:
        channel === "phone"
          ? "Add a phone number before requesting a code"
          : "No email on file to verify",
    });
  }

  // Resend cooldown.
  const wait = cooldownRemaining(user.otp);
  if (wait > 0) {
    return res
      .status(429)
      .json({ error: `Please wait ${wait}s before requesting another code.` });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  user.otp = {
    codeHash: await bcrypt.hash(code, 10),
    channel,
    target,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    lastSentAt: new Date(),
  };
  await user.save();

  const result =
    channel === "phone"
      ? await sendSmsOtp(target, code)
      : await sendEmailOtp(target, code, "verification");

  // In production a failed send is a hard error (the user has no other way to
  // get the code); in dev we still return devCode so the flow is testable.
  if (!result.delivered && !result.skipped && env.NODE_ENV === "production") {
    return res
      .status(502)
      .json({ error: "We couldn't send your code right now. Please try again." });
  }

  return res.status(200).json({
    message: `A 6-digit code was sent to your ${channel}.`,
    channel,
    target,
    delivered: !!result.delivered,
    devCode: exposeCode(code, user.email),
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const channel = req.body.channel === "phone" ? "phone" : "email";
  const code = String(req.body.code || "").trim();

  const user = await User.findById(req.user._id).select("+otp");
  const otp = user.otp;

  if (!otp || otp.channel !== channel) {
    return res
      .status(400)
      .json({ error: "Request a new code before verifying." });
  }
  if (otp.expiresAt && otp.expiresAt.getTime() < Date.now()) {
    user.otp = undefined;
    await user.save();
    return res.status(400).json({ error: "That code has expired. Send a new one." });
  }
  // Guard against verifying a code issued for a since-changed email/phone.
  const current = channel === "phone" ? user.phone : user.email;
  if (otp.target !== current) {
    return res
      .status(400)
      .json({ error: "Your details changed. Request a new code." });
  }
  if (!(await bcrypt.compare(code, otp.codeHash))) {
    return res.status(400).json({ error: "Incorrect code. Try again." });
  }

  if (channel === "phone") user.phoneVerified = true;
  else user.emailVerified = true;
  user.otp = undefined;
  await user.save();

  return res.status(200).json({
    message: `Your ${channel} has been verified.`,
    user: user.toJSON(),
  });
});

// --- Forgot / reset password (public, OTP-powered) ------------------------
exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const user = await User.findOne({ email }).select("+otp");
  // Always respond the same way so we don't reveal which emails are registered.
  const generic = {
    message: "If an account exists for that email, a reset code has been sent.",
  };
  if (!user) return res.status(200).json(generic);

  // Silently rate-limit resends (returning the generic message avoids leaking
  // that the address exists).
  if (cooldownRemaining(user.otp) > 0) {
    return res.status(200).json(generic);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.otp = {
    codeHash: await bcrypt.hash(code, 10),
    channel: "reset",
    target: email,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    lastSentAt: new Date(),
  };
  await user.save();

  await sendEmailOtp(email, code, "password reset");

  return res.status(200).json({ ...generic, devCode: exposeCode(code, email) });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const code = String(req.body.code || "").trim();
  const { newPassword } = req.body;

  const user = await User.findOne({ email }).select("+otp");
  const otp = user && user.otp;
  if (!user || !otp || otp.channel !== "reset") {
    return res.status(400).json({ error: "Request a new reset code." });
  }
  if (otp.expiresAt && otp.expiresAt.getTime() < Date.now()) {
    user.otp = undefined;
    await user.save();
    return res
      .status(400)
      .json({ error: "That code has expired. Send a new one." });
  }
  if (otp.target !== email || !(await bcrypt.compare(code, otp.codeHash))) {
    return res.status(400).json({ error: "Incorrect code. Try again." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  await user.save();

  // Sign the user straight in with a fresh cookie.
  const token = issueToken(res, user);
  return res
    .status(200)
    .json({ message: "Password updated.", user: user.toJSON(), token });
});

exports.goPremium = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isPremium = true;
  await user.save();
  return res.status(200).json({ user: user.toJSON() });
});
