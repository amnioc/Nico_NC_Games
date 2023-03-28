const app = require("../app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return connection.end();
});

describe("/api/categories", () => {
  it("200: should return array of category object with slug and description keys", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        const { categories } = body;
        expect(categories).toBeInstanceOf(Array);
        expect(categories).toHaveLength(4);
        categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  it('"404: returns a "route does not exist" message for mistyped path', () => {
    request(app)
      .get("/api/catgories")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Does Not Exist");
      });
  });
  it("405: returns a 'method not allowed' message for restricted paths", () => {
    request(app)
      .patch("/api/categories")
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).toBe("Method Not Allowed");
      });
  });
});
