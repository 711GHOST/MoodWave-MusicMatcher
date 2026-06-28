const mongoose = require("mongoose");

// Emotions correspond to face-api.js expressions, mapped to a mood playlist each.
const EMOTIONS = [
  "happy",
  "sad",
  "angry",
  "neutral",
  "surprise",
  "fear",
  "disgust",
];

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    thumbnail: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Set for the seeded mood playlists; null for ordinary user playlists.
    emotion: { type: String, enum: [...EMOTIONS, null], default: null, index: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);
module.exports.EMOTIONS = EMOTIONS;
