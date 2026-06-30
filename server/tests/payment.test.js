const request = require("supertest");
const app = require("../src/app");
const db = require("./testDb");
const { createUser, authHeader } = require("./helpers");

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.close());

describe("Payment", () => {
  test("exposes the public Razorpay key id (never the secret)", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get("/payment/config")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(typeof res.body.keyId).toBe("string");
    expect(res.body.plans.INR).toBeDefined();
    expect(JSON.stringify(res.body)).not.toMatch(/key_secret|RAZORPAY_KEY_SECRET/i);
  });

  test("demo confirm activates premium and stores only masked card data", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/payment/confirm-demo")
      .set(authHeader(token))
      .send({
        save: true,
        card: {
          number: "4111111111111111",
          brand: "visa",
          expiry: "08/27",
          name: "JANE DOE",
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.user.isPremium).toBe(true);
    expect(res.body.user.savedCard.last4).toBe("1111");
    expect(res.body.user.savedCard.brand).toBe("visa");
    // The full PAN must never be persisted.
    expect(JSON.stringify(res.body.user)).not.toContain("4111111111111111");
  });

  test("rejects payment verification with a bad signature", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/payment/verify")
      .set(authHeader(token))
      .send({
        razorpay_order_id: "order_test",
        razorpay_payment_id: "pay_test",
        razorpay_signature: "deadbeef",
      });
    expect(res.status).toBe(400);
  });

  test("removes a saved card", async () => {
    const { token } = await createUser();
    await request(app)
      .post("/payment/confirm-demo")
      .set(authHeader(token))
      .send({ save: true, card: { number: "4111111111111111", brand: "visa" } });
    const res = await request(app)
      .delete("/payment/saved-card")
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.user.savedCard).toBeUndefined();
  });
});
