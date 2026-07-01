const request = require("supertest");
const app = require("../src/app");

describe("Audio proxy", () => {
  test("rejects a missing src", async () => {
    const res = await request(app).get("/audio/stream");
    expect(res.status).toBe(400);
  });

  test("rejects a non-http(s) protocol", async () => {
    const res = await request(app)
      .get("/audio/stream")
      .query({ src: "file:///etc/passwd" });
    expect(res.status).toBe(400);
  });

  test("blocks SSRF to a loopback/private host", async () => {
    const res = await request(app)
      .get("/audio/stream")
      .query({ src: "http://127.0.0.1:3001/health" });
    expect(res.status).toBe(403);
  });
});
