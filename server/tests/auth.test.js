const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

const user = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  userName: "tester",
  password: "secret123",
};

describe("Auth", () => {
  test("registers a new user and returns a token (no password leaked)", async () => {
    const res = await request(app).post("/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("rejects a duplicate email", async () => {
    await request(app).post("/auth/register").send(user);
    const res = await request(app)
      .post("/auth/register")
      .send({ ...user, userName: "tester2" });
    expect(res.status).toBe(409);
  });

  test("rejects a weak password via validation", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...user, password: "123" });
    expect(res.status).toBe(422);
  });

  test("logs in with email or username", async () => {
    await request(app).post("/auth/register").send(user);
    const byEmail = await request(app)
      .post("/auth/login")
      .send({ identifier: "test@example.com", password: "secret123" });
    const byUserName = await request(app)
      .post("/auth/login")
      .send({ identifier: "tester", password: "secret123" });
    expect(byEmail.status).toBe(200);
    expect(byUserName.status).toBe(200);
    expect(byEmail.body.token).toBeDefined();
  });

  test("rejects an incorrect password", async () => {
    await request(app).post("/auth/register").send(user);
    const res = await request(app)
      .post("/auth/login")
      .send({ identifier: "tester", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("GET /auth/me requires a token and returns the current user", async () => {
    const unauth = await request(app).get("/auth/me");
    expect(unauth.status).toBe(401);

    const reg = await request(app).post("/auth/register").send(user);
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.userName).toBe("tester");
  });
});
