const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // The performing artist / singer — entered by whoever uploads the song,
    // NOT derived from the uploader's account.
    artist: { type: String, required: true, trim: true },
    thumbnail: { type: String, required: true },
    track: { type: String, required: true },
    // The account that uploaded the song (ownership: "my songs" / delete).
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
