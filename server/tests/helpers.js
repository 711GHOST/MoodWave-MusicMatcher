const request = require("supertest");
const app = require("../src/app");

let counter = 0;

// Registers a fresh user and returns { token, user }.
async function createUser(overrides = {}) {
  counter += 1;
  const payload = {
    firstName: "User",
    lastName: "Test",
    email: `user${counter}@example.com`,
    userName: `user${counter}`,
    password: "secret123",
    ...overrides,
  };
  const res = await request(app).post("/auth/register").send(payload);
  return { token: res.body.token, user: res.body.user };
}

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { createUser, authHeader };
