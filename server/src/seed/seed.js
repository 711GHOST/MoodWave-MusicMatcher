const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");
const data = require("./data");

/**
 * Wipes and re-creates the sample data set. Returns counts for logging.
 */
async function seedDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Song.deleteMany({}),
    Playlist.deleteMany({}),
  ]);

  // Users (passwords hashed like real signups).
  const userDocs = await Promise.all(
    data.users.map(async (u) => ({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      userName: u.userName,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  const users = await User.create(userDocs);
  const userByKey = {};
  data.users.forEach((u, i) => {
    userByKey[u.key] = users[i];
  });

  // Songs — `artist` is the performing-artist string; uploadedBy is the system.
  const uploader = userByKey[data.songUploader]._id;
  const songDocs = data.songs.map((s) => ({
    name: s.name,
    artist: s.artist,
    thumbnail: s.thumbnail,
    track: s.track,
    uploadedBy: uploader,
  }));
  const songs = await Song.create(songDocs);
  const songByName = {};
  songs.forEach((s) => {
    songByName[s.name] = s;
  });

  // Playlists — built-in catalog, marked featured.
  const owner = userByKey[data.playlistOwner]._id;
  const playlistDocs = data.playlists.map((p) => ({
    name: p.name,
    thumbnail: p.thumbnail,
    owner,
    emotion: p.emotion || null,
    isFeatured: true,
    songs: p.songs.map((name) => songByName[name]?._id).filter(Boolean),
  }));
  await Playlist.create(playlistDocs);

  return {
    users: users.length,
    songs: songs.length,
    playlists: playlistDocs.length,
  };
}

/** Seeds only when the database has no songs yet. */
async function seedIfEmpty() {
  const count = await Song.countDocuments();
  if (count > 0) return { skipped: true };
  return seedDatabase();
}

// `npm run seed` — seeds whatever database MONGODB_URI points at.
if (require.main === module) {
  (async () => {
    const { connectDB, disconnectDB } = require("../config/db");
    try {
      const { usingMemory } = await connectDB();
      if (usingMemory) {
        console.warn(
          "Warning: no MONGODB_URI set — seeding a throwaway in-memory DB. " +
            "Set MONGODB_URI in .env to seed a persistent database."
        );
      }
      const result = await seedDatabase();
      console.log("Seed complete:", result);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error("Seed failed:", err);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase, seedIfEmpty };
