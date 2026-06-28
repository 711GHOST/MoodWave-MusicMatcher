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
    isPremium: { type: Boolean, default: false },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    likedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
