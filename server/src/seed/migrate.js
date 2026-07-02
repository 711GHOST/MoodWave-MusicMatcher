// Non-destructive migration for an already-seeded / production database.
// Unlike `npm run seed` (which wipes everything), this only ADDS data and is
// idempotent — safe to run repeatedly. It never touches users or deletes anything.
//
//   1) Backfills Song.moods from featured mood-playlist membership, so existing
//      songs get tagged with the mood(s) whose playlist they already live in.
//   2) Creates the featured albums (from seed data) if they don't exist yet,
//      linking songs by name and setting each song's reverse `album` pointer.
//
// Run against a persistent DB:  MONGODB_URI=... npm run migrate

const User = require("../models/User");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");
const Album = require("../models/Album");
const data = require("./data");

async function backfillMoods() {
  const moodPlaylists = await Playlist.find({ emotion: { $ne: null } });
  let updated = 0;
  for (const p of moodPlaylists) {
    if (!p.songs.length) continue;
    const res = await Song.updateMany(
      { _id: { $in: p.songs } },
      { $addToSet: { moods: p.emotion } }
    );
    updated += res.modifiedCount || 0;
  }
  return updated;
}

async function createAlbums() {
  const albums = data.albums || [];
  if (!albums.length) return 0;

  // Featured albums are owned by the system catalog account (fall back to the
  // owner of an existing featured playlist if the account isn't found by name).
  let owner = await User.findOne({ userName: "moodwave" });
  if (!owner) {
    const featured = await Playlist.findOne({ isFeatured: true });
    owner = featured && { _id: featured.owner };
  }
  if (!owner) {
    throw new Error("No catalog owner found — seed the catalog first.");
  }

  let created = 0;
  for (const a of albums) {
    const exists = await Album.findOne({ title: a.title, isFeatured: true });
    if (exists) continue;

    const songs = await Song.find({ name: { $in: a.songs } }).select("_id");
    const songIds = songs.map((s) => s._id);
    const album = await Album.create({
      title: a.title,
      artist: a.artist,
      kind: a.kind,
      year: a.year,
      thumbnail: a.thumbnail,
      owner: owner._id,
      isFeatured: true,
      songs: songIds,
    });
    await Song.updateMany({ _id: { $in: songIds } }, { album: album._id });
    created += 1;
  }
  return created;
}

async function migrate() {
  const moodsUpdated = await backfillMoods();
  const albumsCreated = await createAlbums();
  return { moodsUpdated, albumsCreated };
}

if (require.main === module) {
  (async () => {
    const { connectDB, disconnectDB } = require("../config/db");
    try {
      const { usingMemory } = await connectDB();
      if (usingMemory) {
        console.warn(
          "Warning: no MONGODB_URI set — migrating a throwaway in-memory DB."
        );
      }
      const result = await migrate();
      console.log("Migration complete:", result);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error("Migration failed:", err);
      process.exit(1);
    }
  })();
}

module.exports = { migrate, backfillMoods, createAlbums };
