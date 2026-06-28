const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

const songPayload = {
  name: "My Song",
  artist: "Test Artist",
  thumbnail: "http://example.com/img.jpg",
  track: "http://example.com/track.mp3",
};

describe("Songs", () => {
  test("creates a song with the entered artist, not the uploader", async () => {
    const { token, user } = await createUser();
    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ ...songPayload, artist: "Some Other Singer" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("My Song");
    // Performing artist comes from the request, NOT the logged-in user.
    expect(res.body.artist).toBe("Some Other Singer");
    expect(res.body.uploadedBy).toBe(user._id);
  });

  test("rejects unauthenticated create", async () => {
    const res = await request(app).post("/song/create").send(songPayload);
    expect(res.status).toBe(401);
  });

  test("rejects create with missing fields (incl. artist)", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ name: "Incomplete", thumbnail: "t", track: "u" });
    expect(res.status).toBe(422);
  });

  test("lists my songs", async () => {
    const { token } = await createUser();
    await request(app).post("/song/create").set(authHeader(token)).send(songPayload);
    const res = await request(app).get("/song/get/mysongs").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test("toggles like on/off and lists liked songs", async () => {
    const { token } = await createUser();
    const created = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send(songPayload);
    const songId = created.body._id;

    const liked = await request(app)
      .post(`/song/like/${songId}`)
      .set(authHeader(token));
    expect(liked.body.liked).toBe(true);

    let list = await request(app).get("/song/get/liked").set(authHeader(token));
    expect(list.body.data).toHaveLength(1);

    const unliked = await request(app)
      .post(`/song/like/${songId}`)
      .set(authHeader(token));
    expect(unliked.body.liked).toBe(false);

    list = await request(app).get("/song/get/liked").set(authHeader(token));
    expect(list.body.data).toHaveLength(0);
  });

  test("searches songs by name OR artist", async () => {
    const { token } = await createUser();
    await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ ...songPayload, name: "Zephyr", artist: "Cool Band" });

    const byName = await request(app)
      .get("/song/get/songname/zephyr")
      .set(authHeader(token));
    expect(byName.body.data).toHaveLength(1);

    const byArtist = await request(app)
      .get("/song/get/songname/cool")
      .set(authHeader(token));
    expect(byArtist.body.data).toHaveLength(1);
  });

  test("only the uploader can delete a song", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const created = await request(app)
      .post("/song/create")
      .set(authHeader(owner.token))
      .send(songPayload);
    const songId = created.body._id;

    const denied = await request(app)
      .delete(`/song/${songId}`)
      .set(authHeader(stranger.token));
    expect(denied.status).toBe(403);

    const ok = await request(app)
      .delete(`/song/${songId}`)
      .set(authHeader(owner.token));
    expect(ok.status).toBe(200);
  });
});
