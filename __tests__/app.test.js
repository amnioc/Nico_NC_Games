const app = require("../app.js");
const sorted = require("jest-sorted");
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

  it('400: should return "invalid data-type" for non-numerical review ID', () => {
    return request(app)
      .get("/api/reviews/Jenga")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Format");
      });
  });

  it("404: review does not exist. Returns error message", () => {
    return request(app)
      .get("/api/reviews/123")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Review Does Not Exist, Yet.");
      });
  });
});

describe("/api/reviews", () => {
  it("200: returns array of review objects, sorted by date desc and including comment count ", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13);
        reviews.forEach((review) => {
          expect(review).toHaveProperty("comment_count", expect.any(Number));
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("votes", expect.any(Number));
          expect(review).toHaveProperty("designer", expect.any(String));
        });

        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  it("404: returns `route does not exist` message for a mistyped path", () => {
    return request(app)
      .get("/api/allreviews")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Does Not Exist");
      });
  });
});

describe("General Errors/Issues Handling", () => {
  it('"404: returns a "route does not exist" message for mistyped path', () => {
    return request(app)
      .get("/api/catgories")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Does Not Exist");
      });
  });
  it("405: returns a 'method not allowed' message for restricted paths", () => {
    return request(app)
      .patch("/api/categories")
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).toBe("Method Not Allowed");
      });
  });
});
