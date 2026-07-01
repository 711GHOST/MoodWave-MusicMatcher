const User = require("../models/User");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");

// The accounts to preserve — the demo login and the system "Moodwave" catalog owner.
const KEEP_EMAILS = ["demo@moodwave.app", "music@moodwave.app"];

/**
 * Removes every user except the demo + system accounts, along with the songs
 * and playlists they own, and strips them from any remaining collaborator lists.
 * The featured catalog (owned by the system account) is preserved.
 */
async function cleanUsers() {
  const keep = await User.find({ email: { $in: KEEP_EMAILS } }).select("_id");
  const keepIds = keep.map((u) => u._id);

  const [removedUsers, removedSongs, removedPlaylists] = await Promise.all([
    User.deleteMany({ _id: { $nin: keepIds } }),
    Song.deleteMany({ uploadedBy: { $nin: keepIds } }),
    Playlist.deleteMany({ owner: { $nin: keepIds } }),
  ]);
  // Drop dangling collaborator references to the removed users.
  await Playlist.updateMany(
    {},
    { $pull: { collaborators: { $nin: keepIds } } }
  );

  return {
    keptUsers: keepIds.length,
    removedUsers: removedUsers.deletedCount,
    removedSongs: removedSongs.deletedCount,
    removedPlaylists: removedPlaylists.deletedCount,
  };
}

// `npm run db:clean` — cleans whatever database MONGODB_URI points at.
if (require.main === module) {
  (async () => {
    const { connectDB, disconnectDB } = require("../config/db");
    try {
      const { usingMemory } = await connectDB();
      if (usingMemory) {
        console.warn(
          "Warning: no MONGODB_URI set — this connected to a throwaway in-memory DB, " +
            "so there is no persistent data to clean. The live dev server already " +
            "resets to a fresh seed on every restart. Set MONGODB_URI to clean a real database."
        );
      }
      const result = await cleanUsers();
      console.log("DB cleaned (demo + system kept):", result);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error("Clean failed:", err);
      process.exit(1);
    }
  })();
}

module.exports = { cleanUsers };
