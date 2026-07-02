const Album = require("../models/Album");
const Song = require("../models/Song");
const asyncHandler = require("../utils/asyncHandler");

// Sets the reverse `album` pointer on the given songs (and clears it elsewhere
// for songs removed from this album), keeping Song.album in sync with the list.
const syncSongAlbum = async (albumId, songIds) => {
  await Song.updateMany({ _id: { $in: songIds } }, { album: albumId });
};

exports.create = asyncHandler(async (req, res) => {
  const { title, artist, kind, thumbnail, songs = [], year } = req.body;
  const album = await Album.create({
    title,
    artist,
    kind,
    thumbnail,
    year,
    songs,
    owner: req.user._id,
  });
  if (songs.length) await syncSongAlbum(album._id, songs);
  await album.populate("songs");
  return res.status(201).json(album);
});

// Built-in catalog albums shown on Home for everyone.
exports.getFeatured = asyncHandler(async (req, res) => {
  const albums = await Album.find({ isFeatured: true }).sort("createdAt");
  return res.status(200).json({ data: albums });
});

// Albums owned by the current user (their library).
exports.getMine = asyncHandler(async (req, res) => {
  const albums = await Album.find({ owner: req.user._id }).sort("-createdAt");
  return res.status(200).json({ data: albums });
});

exports.getById = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.albumId)
    .populate("songs")
    .populate("owner");
  if (!album) {
    return res.status(404).json({ error: "Album not found" });
  }
  return res.status(200).json(album);
});

exports.addSong = asyncHandler(async (req, res) => {
  const { albumId, songId } = req.body;
  const album = await Album.findById(albumId);
  if (!album) {
    return res.status(404).json({ error: "Album not found" });
  }
  if (!album.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "You can only edit your own albums" });
  }
  const song = await Song.findById(songId);
  if (!song) {
    return res.status(404).json({ error: "Song not found" });
  }
  if (!album.songs.some((id) => id.equals(songId))) {
    album.songs.push(songId);
    await album.save();
    await syncSongAlbum(album._id, [songId]);
  }
  await album.populate("songs");
  return res.status(200).json(album);
});

exports.removeSong = asyncHandler(async (req, res) => {
  const { albumId, songId } = req.body;
  const album = await Album.findById(albumId);
  if (!album) {
    return res.status(404).json({ error: "Album not found" });
  }
  if (!album.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "You can only edit your own albums" });
  }
  album.songs = album.songs.filter((id) => !id.equals(songId));
  await album.save();
  await Song.updateOne({ _id: songId, album: albumId }, { album: null });
  await album.populate("songs");
  return res.status(200).json(album);
});

exports.remove = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.albumId);
  if (!album) {
    return res.status(404).json({ error: "Album not found" });
  }
  if (!album.owner.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "You can only delete your own albums" });
  }
  await Song.updateMany({ album: album._id }, { album: null });
  await album.deleteOne();
  return res.status(200).json({ message: "Album deleted" });
});
