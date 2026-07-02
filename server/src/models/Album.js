const mongoose = require("mongoose");

// The kind of act an album is credited to.
const ALBUM_KINDS = ["singer", "band", "group", "movie"];

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // The credited singer / band / group / movie name (a string).
    artist: { type: String, required: true, trim: true },
    kind: { type: String, enum: ALBUM_KINDS, default: "singer" },
    thumbnail: { type: String, required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number },
    // Built-in catalog albums shown to everyone on Home.
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Album", albumSchema);
module.exports.ALBUM_KINDS = ALBUM_KINDS;
