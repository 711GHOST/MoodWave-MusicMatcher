const Song = require("../models/Song");
const Playlist = require("../models/Playlist");
const asyncHandler = require("../utils/asyncHandler");

// Escape user input before using it inside a RegExp (avoids regex injection/ReDoS).
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// First page of songs returned by the unified search; "load more" then pages
// through GET /song/get/songname/:q?page=N.
const SONG_PAGE_SIZE = 10;

// Unified search across songs, playlists and performing artists.
exports.searchAll = asyncHandler(async (req, res) => {
  const raw = (req.params.query || "").trim();
  if (!raw) {
    return res.status(200).json({
      songs: [],
      playlists: [],
      artists: [],
      songsTotal: 0,
      songsHasMore: false,
    });
  }
  const re = { $regex: escapeRegex(raw), $options: "i" };
  const songFilter = { $or: [{ name: re }, { artist: re }] };

  const [songs, songsTotal, playlists, artistAgg] = await Promise.all([
    Song.find(songFilter).sort("-createdAt").limit(SONG_PAGE_SIZE),
    Song.countDocuments(songFilter),
    // Playlists you can actually open: featured catalog, public, or your own.
    Playlist.find({
      name: re,
      $or: [{ isFeatured: true }, { isPublic: true }, { owner: req.user._id }],
    })
      .populate("owner")
      .limit(30),
    // Artists are derived from the performing-singer string on songs.
    Song.aggregate([
      { $match: { artist: re } },
      {
        $group: {
          _id: "$artist",
          songCount: { $sum: 1 },
          thumbnail: { $first: "$thumbnail" },
        },
      },
      { $sort: { songCount: -1 } },
      { $limit: 24 },
    ]),
  ]);

  const artists = artistAgg.map((a) => ({
    name: a._id,
    songCount: a.songCount,
    thumbnail: a.thumbnail,
  }));

  return res.status(200).json({
    songs,
    playlists,
    artists,
    songsTotal,
    songsHasMore: songsTotal > songs.length,
  });
});
