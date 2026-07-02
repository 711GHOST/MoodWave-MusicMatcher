const mongoose = require("mongoose");
const env = require("./env");

let memoryServer = null;

/**
 * Connects mongoose to either the configured MONGODB_URI, or - when none is
 * provided - a self-contained in-memory MongoDB. This lets the app run and be
 * tested with zero external setup.
 */
async function connectDB() {
  let uri = env.MONGODB_URI;
  let usingMemory = false;

  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    usingMemory = true;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "moodwave" });
  return { uri, usingMemory };
}

async function disconnectDB() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
