const mongoose = require("mongoose");
const { EMOTIONS } = require("../constants/emotions");

const songSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // The performing artist / singer - entered by whoever uploads the song,
    // NOT derived from the uploader's account.
    artist: { type: String, required: true, trim: true },
    thumbnail: { type: String, required: true },
    track: { type: String, required: true },
    // Mood tags (face-api emotions). A song tagged with a mood is auto-added to
    // that mood's playlist; a song can carry several moods at once.
    moods: {
      type: [{ type: String, enum: EMOTIONS }],
      default: [],
      index: true,
    },
    // Optional album this song belongs to.
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      default: null,
      index: true,
    },
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
