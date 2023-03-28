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
  //error handling below
});

describe("/api/reviews/:review_id", () => {
  it("200: returns an object with relevant properties related to review_id ", () => {
    const testObj = {
      review_id: 2,
      title: "Jenga",
      category: "dexterity",
      designer: "Leslie Scott",
      owner: "philippaclaire9",
      review_body: "Fiddly fun for all the family",
      review_img_url:
        "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700",
      created_at: `2021-01-18T10:01:41.251Z`,
      votes: 5,
    };
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toBeInstanceOf(Object);
        expect(Object.keys(review).length).toBe(9);
        expect(review).toEqual(testObj);
      });
  });
});
//doesn't exist but ok
//incorrect format

describe("Errors/Issues Handling", () => {
  it('"404: returns a "route does not exist" message for mistyped path', () => {
    return request(app)
      .get("/api/catgories")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Does Not Exist");
      });
  });
  it.skip("405: returns a 'method not allowed' message for restricted paths", () => {
    return request(app)
      .patch("/api/categories")
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).toBe("Method Not Allowed");
      });
  });
});
