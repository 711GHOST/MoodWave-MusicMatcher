const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const populateSongs = {
  path: "songs",
  populate: { path: "artist", model: "User" },
};

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

exports.getById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.playlistId)
    .populate(populateSongs)
    .populate("owner");
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }
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
