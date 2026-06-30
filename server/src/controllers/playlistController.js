const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// Song.artist is now a plain string, so a simple "songs" populate is enough.
const populateSongs = "songs";

const canEdit = (playlist, userId) =>
  playlist.owner.equals(userId) ||
  playlist.collaborators.some((id) => id.equals(userId));

exports.create = asyncHandler(async (req, res) => {
  const { name, thumbnail, songs = [] } = req.body;
  const playlist = await Playlist.create({
    name,
    thumbnail,
    songs,
    owner: req.user._id,
    collaborators: [],
  });
  return res.status(201).json(playlist);
});

// Built-in catalog playlists shown on Home for everyone.
exports.getFeatured = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ isFeatured: true })
    .populate("owner")
    .sort("createdAt");
  return res.status(200).json({ data: playlists });
});

exports.getById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.playlistId)
    .populate(populateSongs)
    .populate("owner")
    .populate("collaborators");
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  return res.status(200).json(playlist);
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  const user = await User.findById(req.user._id);
  const idx = user.likedPlaylists.findIndex((id) => id.equals(playlistId));
  let liked;
  if (idx >= 0) {
    user.likedPlaylists.splice(idx, 1);
    liked = false;
  } else {
    user.likedPlaylists.push(playlistId);
    liked = true;
  }
  await user.save();
  return res.status(200).json({ liked, likedPlaylists: user.likedPlaylists });
});

exports.getLiked = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "likedPlaylists",
    populate: { path: "owner" },
  });
  return res.status(200).json({ data: user.likedPlaylists });
});

exports.addCollaborator = asyncHandler(async (req, res) => {
  const { playlistId, identifier } = req.body;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  if (!playlist.owner.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "Only the owner can manage collaborators" });
  }
  const id = (identifier || "").trim();
  const collaborator = await User.findOne({
    $or: [{ email: id.toLowerCase() }, { userName: id }],
  });
  if (!collaborator) {
    return res
      .status(404)
      .json({ error: "No user found with that username or email" });
  }
  if (collaborator._id.equals(playlist.owner)) {
    return res.status(400).json({ error: "You already own this playlist" });
  }
  if (playlist.collaborators.some((c) => c.equals(collaborator._id))) {
    return res.status(409).json({ error: "Already a collaborator" });
  }
  playlist.collaborators.push(collaborator._id);
  await playlist.save();
  await playlist.populate("owner");
  await playlist.populate("collaborators");
  return res.status(200).json(playlist);
});

exports.removeCollaborator = asyncHandler(async (req, res) => {
  const { playlistId, userId } = req.body;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  if (!playlist.owner.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "Only the owner can manage collaborators" });
  }
  playlist.collaborators = playlist.collaborators.filter(
    (c) => !c.equals(userId)
  );
  await playlist.save();
  await playlist.populate("owner");
  await playlist.populate("collaborators");
  return res.status(200).json(playlist);
});

exports.getMine = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id })
    .populate("owner")
    .sort("-createdAt");
  return res.status(200).json({ data: playlists });
});

exports.getByArtist = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const artist = await User.findById(artistId);
  if (!artist) {
    return res.status(404).json({ error: "Artist not found" });
  }
  const playlists = await Playlist.find({ owner: artistId });
  return res.status(200).json({ data: playlists });
});

exports.getByEmotion = asyncHandler(async (req, res) => {
  const emotion = (req.params.emotion || req.body.emotion || "")
    .toString()
    .toLowerCase();
  if (!emotion) {
    return res.status(400).json({ error: "Emotion not provided" });
  }
  const playlist = await Playlist.findOne({ emotion }).populate(populateSongs);
  if (!playlist) {
    return res
      .status(404)
      .json({ error: `No playlist found for the "${emotion}" mood` });
  }
  return res.status(200).json(playlist);
});

exports.addSong = asyncHandler(async (req, res) => {
  const { playlistId, songId } = req.body;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  if (!canEdit(playlist, req.user._id)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to edit this playlist" });
  }
  const song = await Song.findById(songId);
  if (!song) {
    return res.status(404).json({ error: "Song not found" });
  }
  if (!playlist.songs.some((id) => id.equals(songId))) {
    playlist.songs.push(songId);
    await playlist.save();
  }
  await playlist.populate(populateSongs);
  return res.status(200).json(playlist);
});

exports.removeSong = asyncHandler(async (req, res) => {
  const { playlistId, songId } = req.body;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  if (!canEdit(playlist, req.user._id)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to edit this playlist" });
  }
  playlist.songs = playlist.songs.filter((id) => !id.equals(songId));
  await playlist.save();
  await playlist.populate(populateSongs);
  return res.status(200).json(playlist);
});

exports.remove = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.playlistId);
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
  if (!playlist.owner.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "You can only delete your own playlists" });
  }
  await playlist.deleteOne();
  return res.status(200).json({ message: "Playlist deleted" });
});
