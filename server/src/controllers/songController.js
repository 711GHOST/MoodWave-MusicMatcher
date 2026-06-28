const Song = require("../models/Song");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  const { name, thumbnail, track } = req.body;
  const song = await Song.create({
    name,
    thumbnail,
    track,
    artist: req.user._id,
  });
  await song.populate("artist");
  return res.status(201).json(song);
});

exports.getAll = asyncHandler(async (req, res) => {
  const songs = await Song.find()
    .populate("artist")
    .sort("-createdAt")
    .limit(200);
  return res.status(200).json({ data: songs });
});

exports.getMySongs = asyncHandler(async (req, res) => {
  const songs = await Song.find({ artist: req.user._id })
    .populate("artist")
    .sort("-createdAt");
  return res.status(200).json({ data: songs });
});

exports.getByArtist = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const artist = await User.findById(artistId);
  if (!artist) {
    return res.status(404).json({ error: "Artist not found" });
  }
  const songs = await Song.find({ artist: artistId }).populate("artist");
  return res.status(200).json({ data: songs });
});

exports.search = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const songs = await Song.find({
    name: { $regex: query, $options: "i" },
  }).populate("artist");
  return res.status(200).json({ data: songs });
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
  const user = await User.findById(req.user._id).populate({
    path: "likedSongs",
    populate: { path: "artist", model: "User" },
  });
  return res.status(200).json({ data: user.likedSongs });
});

exports.remove = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  const song = await Song.findById(songId);
  if (!song) {
    return res.status(404).json({ error: "Song not found" });
  }
  if (!song.artist.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "You can only delete songs you uploaded" });
  }
  await song.deleteOne();
  return res.status(200).json({ message: "Song deleted" });
});
