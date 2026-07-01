const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");
const { seedDatabase } = require("../src/seed/seed");
const { cleanUsers } = require("../src/seed/clean");
const User = require("../src/models/User");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

describe("db:clean", () => {
  test("keeps demo + system accounts and removes everyone else", async () => {
    await seedDatabase(); // creates demo@moodwave.app + music@moodwave.app + catalog
    // A throwaway user + their content.
    const { token } = await createUser();
    await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ name: "Junk", artist: "X", thumbnail: "t", track: "u" });

    const before = await User.countDocuments();
    expect(before).toBe(3); // demo + system + the throwaway

    const result = await cleanUsers();
    expect(result.keptUsers).toBe(2);
    expect(result.removedUsers).toBe(1);

    const emails = (await User.find().select("email")).map((u) => u.email).sort();
    expect(emails).toEqual(["demo@moodwave.app", "music@moodwave.app"]);
  });
});
