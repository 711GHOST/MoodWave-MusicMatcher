const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

const songPayload = {
  name: "My Song",
  thumbnail: "http://example.com/img.jpg",
  track: "http://example.com/track.mp3",
};

describe("Songs", () => {
  test("creates a song when authenticated", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send(songPayload);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("My Song");
    expect(res.body.artist).toBeDefined();
  });

  test("rejects unauthenticated create", async () => {
    const res = await request(app).post("/song/create").send(songPayload);
    expect(res.status).toBe(401);
  });

  test("rejects create with missing fields", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({ name: "Incomplete" });
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

  test("searches songs by name (case-insensitive, partial)", async () => {
    const { token } = await createUser();
    await request(app).post("/song/create").set(authHeader(token)).send(songPayload);
    const res = await request(app)
      .get("/song/get/songname/song")
      .set(authHeader(token));
    expect(res.body.data).toHaveLength(1);
  });
});
