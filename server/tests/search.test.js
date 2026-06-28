const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

describe("Search", () => {
  test("returns matching songs, playlists and artists", async () => {
    const { token } = await createUser();
    await request(app)
      .post("/song/create")
      .set(authHeader(token))
      .send({
        name: "Aurora Skies",
        artist: "Nova Lights",
        thumbnail: "t",
        track: "u",
      });
    await request(app)
      .post("/playlist/create")
      .set(authHeader(token))
      .send({ name: "Aurora Chill", thumbnail: "t" });

    const res = await request(app).get("/search/aurora").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.songs).toHaveLength(1);
    expect(res.body.playlists).toHaveLength(1);

    const byArtist = await request(app)
      .get("/search/nova")
      .set(authHeader(token));
    expect(byArtist.body.songs).toHaveLength(1);
    expect(byArtist.body.artists).toHaveLength(1);
    expect(byArtist.body.artists[0].name).toBe("Nova Lights");
    expect(byArtist.body.artists[0].songCount).toBe(1);
  });

  test("requires authentication", async () => {
    const res = await request(app).get("/search/anything");
    expect(res.status).toBe(401);
  });
});
