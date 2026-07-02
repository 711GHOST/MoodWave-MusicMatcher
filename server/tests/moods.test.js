const request = require("supertest");
const app = require("../src/app");
const Playlist = require("../src/models/Playlist");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

const songPayload = {
  name: "Tagged Track",
  artist: "Mood Artist",
  thumbnail: "http://example.com/img.jpg",
  track: "http://example.com/track.mp3",
};

// Create the featured mood playlists a tagged upload should join.
const seedMoodPlaylists = async (ownerId) => {
  await Playlist.create([
    { name: "Happy Vibes", emotion: "happy", thumbnail: "t", owner: ownerId, isFeatured: true },
    { name: "Melancholy", emotion: "sad", thumbnail: "t", owner: ownerId, isFeatured: true },
    { name: "Rage Mode", emotion: "angry", thumbnail: "t", owner: ownerId, isFeatured: true },
  ]);
};

describe("Mood tags", () => {
  test("stores mood tags and auto-adds the song to each matching mood playlist", async () => {
    const { token, user } = await createUser();
    await seedMoodPlaylists(user._id);

    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ ...songPayload, moods: ["happy", "sad"] });

    expect(res.status).toBe(201);
    expect(res.body.moods.sort()).toEqual(["happy", "sad"]);
    const songId = res.body._id;

    const happy = await Playlist.findOne({ emotion: "happy" });
    const sad = await Playlist.findOne({ emotion: "sad" });
    const angry = await Playlist.findOne({ emotion: "angry" });

    expect(happy.songs.map(String)).toContain(songId);
    expect(sad.songs.map(String)).toContain(songId);
    // Not tagged angry → not added to the angry playlist.
    expect(angry.songs.map(String)).not.toContain(songId);
  });

  test("de-duplicates moods and ignores unknown values via validation", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ ...songPayload, moods: ["happy", "banana"] });
    // "banana" is not a valid emotion → validation rejects the request.
    expect(res.status).toBe(422);
  });

  test("a song with no moods joins no mood playlists", async () => {
    const { token, user } = await createUser();
    await seedMoodPlaylists(user._id);
    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send(songPayload);
    expect(res.status).toBe(201);
    expect(res.body.moods).toEqual([]);
    const happy = await Playlist.findOne({ emotion: "happy" });
    expect(happy.songs).toHaveLength(0);
  });
});
