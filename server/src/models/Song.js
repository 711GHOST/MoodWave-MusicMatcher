const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    thumbnail: { type: String, required: true },
    track: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
