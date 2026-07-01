const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userName: { type: String, required: true, unique: true, trim: true },
    // Never returned by default — must be explicitly selected (login flow).
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: "" },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    // Optional saved card — MASKED metadata only. We never store the full PAN
    // or CVV (that would require PCI-DSS compliance).
    savedCard: {
      type: {
        brand: String,
        last4: String,
        expiry: String,
        name: String,
      },
      default: undefined,
    },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    likedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
    // One-time passcode for email/phone verification. Hashed; never returned.
    // (Simulated channel — no real SMS/email provider is wired up.)
    otp: {
      type: {
        codeHash: String,
        channel: String, // "email" | "phone" | "reset"
        target: String, // the email/phone the code was issued for
        expiresAt: Date,
        lastSentAt: Date, // drives the resend cooldown
      },
      select: false,
      default: undefined,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    delete ret.otp;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
