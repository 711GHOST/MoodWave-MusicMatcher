const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");
const { seedDatabase } = require("../src/seed/seed");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

const makeSong = (token) =>
  request(app)
    .post("/song/create")
    .set(authHeader(token))
    .send({ name: "S", artist: "A", thumbnail: "t", track: "u" });

describe("Playlists", () => {
  test("creates a playlist and adds a song", async () => {
    const { token } = await createUser();
    const song = await makeSong(token);
    const pl = await request(app)
      .post("/playlist/create")
      .set(authHeader(token))
      .send({ name: "PL", thumbnail: "t" });
    expect(pl.status).toBe(201);

    const add = await request(app)
      .post("/playlist/add/song")
      .set(authHeader(token))
      .send({ playlistId: pl.body._id, songId: song.body._id });
    expect(add.status).toBe(200);
    expect(add.body.songs).toHaveLength(1);
  });

  test("blocks editing a playlist you do not own", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const song = await makeSong(stranger.token);
    const pl = await request(app)
      .post("/playlist/create")
      .set(authHeader(owner.token))
      .send({ name: "PL", thumbnail: "t" });

    const add = await request(app)
      .post("/playlist/add/song")
      .set(authHeader(stranger.token))
      .send({ playlistId: pl.body._id, songId: song.body._id });
    expect(add.status).toBe(403);
  });

  test("returns a seeded mood playlist by emotion", async () => {
    await seedDatabase();
    const { token } = await createUser();
    const res = await request(app)
      .get("/playlist/get/emotion/happy")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.emotion).toBe("happy");
    expect(res.body.songs.length).toBeGreaterThan(0);
    // Songs carry the performing-artist string.
    expect(typeof res.body.songs[0].artist).toBe("string");
  });

  test("404 when no playlist matches the emotion", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get("/playlist/get/emotion/happy")
      .set(authHeader(token));
    expect(res.status).toBe(404);
  });

  test("lists the featured catalog playlists", async () => {
    await seedDatabase();
    const { token } = await createUser();
    const res = await request(app)
      .get("/playlist/get/featured")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.isFeatured)).toBe(true);
  });
});
