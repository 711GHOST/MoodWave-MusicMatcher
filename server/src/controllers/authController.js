const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");

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

  const token = signToken(user);
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

  const token = signToken(user);
  return res.status(200).json({ user: user.toJSON(), token });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("likedSongs");
  return res.status(200).json({ user: user.toJSON() });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  const user = await User.findById(req.user._id);
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  await user.save();
  return res.status(200).json({ user: user.toJSON() });
});

exports.goPremium = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isPremium = true;
  await user.save();
  return res.status(200).json({ user: user.toJSON() });
});
