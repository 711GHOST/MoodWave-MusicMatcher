const env = require("./config/env");
const app = require("./app");
const { connectDB } = require("./config/db");
const { seedIfEmpty } = require("./seed/seed");

(async () => {
  try {
    const { usingMemory } = await connectDB();

    // Auto-seed the in-memory dev database (or when explicitly requested).
    if (usingMemory || env.SEED_ON_START) {
      const result = await seedIfEmpty();
      if (!result.skipped) {
        console.log(
          `Seeded database: ${result.users} users, ${result.songs} songs, ${result.playlists} playlists.`
        );
      }
    }

    app.listen(env.PORT, () => {
      console.log(
        `Moodwave API running on http://localhost:${env.PORT} ` +
          `(${usingMemory ? "in-memory MongoDB" : "configured MongoDB"})`
      );
    });
  } catch (err) {
    console.error("Failed to start Moodwave API:", err);
    process.exit(1);
  }
})();
