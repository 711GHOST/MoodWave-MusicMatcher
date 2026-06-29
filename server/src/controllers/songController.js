const Song = require("../models/Song");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { parsePageParams, paginated } = require("../utils/paginate");

// Escape user input before using it inside a RegExp (avoids regex injection/ReDoS).
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.create = asyncHandler(async (req, res) => {
  const { name, artist, thumbnail, track } = req.body;
  const song = await Song.create({
    name,
    artist,
    thumbnail,
    track,
    uploadedBy: req.user._id,
  });
  return res.status(201).json(song);
});

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePageParams(req, { defaultLimit: 50 });
  const [songs, total] = await Promise.all([
    Song.find().sort("-createdAt").skip(skip).limit(limit),
    Song.countDocuments(),
  ]);
  return res.status(200).json(paginated(songs, total, page, limit));
});

exports.getMySongs = asyncHandler(async (req, res) => {
  const songs = await Song.find({ uploadedBy: req.user._id }).sort("-createdAt");
  return res.status(200).json({ data: songs });
});

// Songs by performing-artist name (string match).
exports.getByArtist = asyncHandler(async (req, res) => {
  const { artistName } = req.params;
  const songs = await Song.find({
    artist: { $regex: escapeRegex(artistName), $options: "i" },
  }).sort("-createdAt");
  return res.status(200).json({ data: songs });
});

exports.search = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const re = { $regex: escapeRegex(query), $options: "i" };
  const filter = { $or: [{ name: re }, { artist: re }] };
  const { page, limit, skip } = parsePageParams(req, { defaultLimit: 20 });
  const [songs, total] = await Promise.all([
    Song.find(filter).sort("-createdAt").skip(skip).limit(limit),
    Song.countDocuments(filter),
  ]);
  return res.status(200).json(paginated(songs, total, page, limit));
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  const song = await Song.findById(songId);
  if (!song) {
    return res.status(404).json({ error: "Song not found" });
  }

  const user = await User.findById(req.user._id);
  const index = user.likedSongs.findIndex((id) => id.equals(songId));
  let liked;
  if (index >= 0) {
    user.likedSongs.splice(index, 1);
    liked = false;
  } else {
    user.likedSongs.push(songId);
    liked = true;
  }
  await user.save();
  return res.status(200).json({ liked, likedSongs: user.likedSongs });
});

exports.getLiked = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("likedSongs");
  return res.status(200).json({ data: user.likedSongs });
});

exports.remove = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  const song = await Song.findById(songId);
  if (!song) {
    return res.status(404).json({ error: "Song not found" });
  }
  if (!song.uploadedBy.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "You can only delete songs you uploaded" });
  }
  await song.deleteOne();
  return res.status(200).json({ message: "Song deleted" });
});
