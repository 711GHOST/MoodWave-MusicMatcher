const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

const songPayload = {
  name: "Album Track",
  artist: "The Band",
  thumbnail: "http://example.com/img.jpg",
  track: "http://example.com/track.mp3",
};

const makeSong = async (token, overrides = {}) => {
  const res = await request(app)
    .post("/song/create")
    .set(authHeader(token))
    .send({ ...songPayload, ...overrides });
  return res.body._id;
};

const albumPayload = {
  title: "Greatest Hits",
  artist: "The Band",
  kind: "band",
  thumbnail: "http://example.com/cover.jpg",
  year: 2024,
};

describe("Albums", () => {
  test("creates an album with songs and sets the reverse pointer", async () => {
    const { token } = await createUser();
    const songId = await makeSong(token);

    const res = await request(app)
      .post("/album/create")
      .set(authHeader(token))
      .send({ ...albumPayload, songs: [songId] });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Greatest Hits");
    expect(res.body.kind).toBe("band");
    expect(res.body.songs).toHaveLength(1);
    expect(res.body.songs[0]._id).toBe(songId);

    // The song now points back at the album.
    const byId = await request(app)
      .get(`/album/get/album/${res.body._id}`)
      .set(authHeader(token));
    expect(byId.body.songs[0].album).toBe(res.body._id);
  });

  test("rejects an unknown album kind", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/album/create")
      .set(authHeader(token))
      .send({ ...albumPayload, kind: "orchestra" });
    expect(res.status).toBe(422);
  });

  test("lists my albums", async () => {
    const { token } = await createUser();
    await request(app).post("/album/create").set(authHeader(token)).send(albumPayload);
    const res = await request(app).get("/album/get/me").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test("adds and removes songs (owner only)", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const album = await request(app)
      .post("/album/create")
      .set(authHeader(owner.token))
      .send(albumPayload);
    const albumId = album.body._id;
    const songId = await makeSong(owner.token);

    const denied = await request(app)
      .post("/album/add/song")
      .set(authHeader(stranger.token))
      .send({ albumId, songId });
    expect(denied.status).toBe(403);

    const added = await request(app)
      .post("/album/add/song")
      .set(authHeader(owner.token))
      .send({ albumId, songId });
    expect(added.status).toBe(200);
    expect(added.body.songs).toHaveLength(1);

    const removed = await request(app)
      .post("/album/remove/song")
      .set(authHeader(owner.token))
      .send({ albumId, songId });
    expect(removed.body.songs).toHaveLength(0);
  });

  test("only the owner can delete an album", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const album = await request(app)
      .post("/album/create")
      .set(authHeader(owner.token))
      .send(albumPayload);

    const denied = await request(app)
      .delete(`/album/${album.body._id}`)
      .set(authHeader(stranger.token));
    expect(denied.status).toBe(403);

    const ok = await request(app)
      .delete(`/album/${album.body._id}`)
      .set(authHeader(owner.token));
    expect(ok.status).toBe(200);
  });
});
