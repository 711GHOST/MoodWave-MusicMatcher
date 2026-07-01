require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3001", 10),
  // Empty MONGODB_URI => spin up an in-memory MongoDB (see config/db.js).
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev-moodwave-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  SEED_ON_START: process.env.SEED_ON_START === "true",
  // Razorpay (test). Key ID is public; secret must never reach the client.
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  // Resend (email) + Twilio (SMS) for OTP delivery. All server-side only.
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM: process.env.RESEND_FROM || "Moodwave <onboarding@resend.dev>",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID || "",
  TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET || "",
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER || "",
};

module.exports = env;
