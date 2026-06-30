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

  test("toggles a playlist like and lists liked playlists", async () => {
    const owner = await createUser();
    const fan = await createUser();
    const pl = await request(app)
      .post("/playlist/create")
      .set(authHeader(owner.token))
      .send({ name: "PL", thumbnail: "t" });

    const liked = await request(app)
      .post(`/playlist/like/${pl.body._id}`)
      .set(authHeader(fan.token));
    expect(liked.body.liked).toBe(true);

    let list = await request(app)
      .get("/playlist/get/liked")
      .set(authHeader(fan.token));
    expect(list.body.data).toHaveLength(1);

    const unliked = await request(app)
      .post(`/playlist/like/${pl.body._id}`)
      .set(authHeader(fan.token));
    expect(unliked.body.liked).toBe(false);

    list = await request(app)
      .get("/playlist/get/liked")
      .set(authHeader(fan.token));
    expect(list.body.data).toHaveLength(0);
  });

  test("owner can add/remove a collaborator; non-owners cannot", async () => {
    const owner = await createUser();
    const friend = await createUser({ userName: "collabfriend" });
    const stranger = await createUser();
    const pl = await request(app)
      .post("/playlist/create")
      .set(authHeader(owner.token))
      .send({ name: "PL", thumbnail: "t" });

    const denied = await request(app)
      .post("/playlist/collaborators/add")
      .set(authHeader(stranger.token))
      .send({ playlistId: pl.body._id, identifier: "collabfriend" });
    expect(denied.status).toBe(403);

    const added = await request(app)
      .post("/playlist/collaborators/add")
      .set(authHeader(owner.token))
      .send({ playlistId: pl.body._id, identifier: "collabfriend" });
    expect(added.status).toBe(200);
    expect(added.body.collaborators).toHaveLength(1);
    expect(added.body.collaborators[0].userName).toBe("collabfriend");

    // A collaborator can now edit the playlist (add a song).
    const song = await makeSong(friend.token);
    const edit = await request(app)
      .post("/playlist/add/song")
      .set(authHeader(friend.token))
      .send({ playlistId: pl.body._id, songId: song.body._id });
    expect(edit.status).toBe(200);

    const unknown = await request(app)
      .post("/playlist/collaborators/add")
      .set(authHeader(owner.token))
      .send({ playlistId: pl.body._id, identifier: "ghost-user" });
    expect(unknown.status).toBe(404);

    const removed = await request(app)
      .post("/playlist/collaborators/remove")
      .set(authHeader(owner.token))
      .send({ playlistId: pl.body._id, userId: friend.user._id });
    expect(removed.status).toBe(200);
    expect(removed.body.collaborators).toHaveLength(0);
  });
});
