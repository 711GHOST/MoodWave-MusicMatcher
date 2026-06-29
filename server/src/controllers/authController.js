const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

const TOKEN_COOKIE = "token";
// httpOnly so the JWT is never exposed to JavaScript (XSS-resistant).
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN
  path: "/",
});

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
// Simulated: no real email/SMS is sent. The generated code is returned to the
// client as `devCode` so the flow is fully demonstrable end-to-end.
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

exports.sendOtp = asyncHandler(async (req, res) => {
  const channel = req.body.channel === "phone" ? "phone" : "email";
  const user = await User.findById(req.user._id);

  const target = channel === "phone" ? user.phone : user.email;
  if (!target) {
    return res.status(422).json({
      error:
        channel === "phone"
          ? "Add a phone number before requesting a code"
          : "No email on file to verify",
    });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  user.otp = {
    codeHash: await bcrypt.hash(code, 10),
    channel,
    target,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  };
  await user.save();

  return res.status(200).json({
    message: `A 6-digit code was sent to your ${channel}.`,
    channel,
    target,
    // Demo only — a real deployment would never return the code.
    devCode: code,
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

exports.goPremium = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isPremium = true;
  await user.save();
  return res.status(200).json({ user: user.toJSON() });
});
