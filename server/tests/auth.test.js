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

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

describe("Auth", () => {
  test("registers a new user and flags isNewUser (no password leaked)", async () => {
    const res = await request(app).post("/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.isNewUser).toBe(true);
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.isPremium).toBe(false);
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
    const res = await request(app).get("/auth/me").set(bearer(reg.body.token));
    expect(res.status).toBe(200);
    expect(res.body.user.userName).toBe("tester");
  });

  test("updates the profile name via PATCH /auth/me", async () => {
    const reg = await request(app).post("/auth/register").send(user);
    const res = await request(app)
      .patch("/auth/me")
      .set(bearer(reg.body.token))
      .send({ firstName: "Renamed", lastName: "Person" });
    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe("Renamed");
    expect(res.body.user.lastName).toBe("Person");
  });

  test("upgrades the account to premium", async () => {
    const reg = await request(app).post("/auth/register").send(user);
    expect(reg.body.user.isPremium).toBe(false);
    const res = await request(app)
      .post("/auth/premium")
      .set(bearer(reg.body.token));
    expect(res.status).toBe(200);
    expect(res.body.user.isPremium).toBe(true);
  });

  test("updates email/phone and marks them unverified, rejecting duplicates", async () => {
    const reg = await request(app).post("/auth/register").send(user);
    // Another account to collide with.
    await request(app)
      .post("/auth/register")
      .send({ ...user, email: "taken@example.com", userName: "other" });

    const ok = await request(app)
      .patch("/auth/me")
      .set(bearer(reg.body.token))
      .send({ email: "new@example.com", phone: "+1 555 123 4567" });
    expect(ok.status).toBe(200);
    expect(ok.body.user.email).toBe("new@example.com");
    expect(ok.body.user.phone).toBe("+1 555 123 4567");
    expect(ok.body.user.emailVerified).toBe(false);
    expect(ok.body.user.phoneVerified).toBe(false);

    const dupe = await request(app)
      .patch("/auth/me")
      .set(bearer(reg.body.token))
      .send({ email: "taken@example.com" });
    expect(dupe.status).toBe(409);
  });

  test("verifies email via an OTP and rejects a wrong code", async () => {
    const reg = await request(app).post("/auth/register").send(user);
    const auth = bearer(reg.body.token);

    const send = await request(app)
      .post("/auth/otp/send")
      .set(auth)
      .send({ channel: "email" });
    expect(send.status).toBe(200);
    expect(send.body.devCode).toMatch(/^\d{6}$/);

    const wrong = await request(app)
      .post("/auth/otp/verify")
      .set(auth)
      .send({ channel: "email", code: "000000" });
    expect(wrong.status).toBe(400);

    const right = await request(app)
      .post("/auth/otp/verify")
      .set(auth)
      .send({ channel: "email", code: send.body.devCode });
    expect(right.status).toBe(200);
    expect(right.body.user.emailVerified).toBe(true);
  });

  test("rejects requesting a phone OTP with no phone on file", async () => {
    const reg = await request(app).post("/auth/register").send(user);
    const res = await request(app)
      .post("/auth/otp/send")
      .set(bearer(reg.body.token))
      .send({ channel: "phone" });
    expect(res.status).toBe(422);
  });
});
