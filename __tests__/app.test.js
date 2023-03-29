const app = require("../app.js");
const sorted = require("jest-sorted");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");

//for path and method error handling, see bottom

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

  it('400: should return "invalid data-format" for non-numerical review ID', () => {
    return request(app)
      .get("/api/reviews/Jenga")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Format for ID");
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

describe("/api/reviews/:review_id/comments", () => {
  it("200: should return an array of comments for review_id in path", () => {
    const testObj = {
      comment_id: 4,
      body: "EPIC board game!",
      votes: 16,
      author: "bainesface",
      review_id: 2,
      created_at: `2017-11-22T12:36:03.389Z`,
    };
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { reviewComments } = body;
        expect(reviewComments).toBeInstanceOf(Array);
        expect(reviewComments).toHaveLength(3);
        expect(reviewComments[2]).toEqual(testObj); //oldest comment of 3 in testData
        reviewComments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("review_id", expect.any(Number));
        });
        expect(reviewComments).toBeSortedBy("created_at", { descending: true });
      });
  });
  it('400: should return "invalid data format for review_id" message for incorrect data type', () => {
    return request(app)
      .get("/api/reviews/Jenga/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Format for ID");
      });
  });
  it("404: review does not exist. Returns error message", () => {
    return request(app)
      .get("/api/reviews/123/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Review Does Not Exist, Yet.");
      });
  });
  it("405: returns Method Not Allowed message for DELETE path", () => {
    return request(app)
      .delete("/api/reviews/1/comments")
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).toBe("Method Not Allowed!");
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
        expect(body.msg).toBe("Method Not Allowed!");
      });
  });
});
