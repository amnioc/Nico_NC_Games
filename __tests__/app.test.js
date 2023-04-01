const app = require("../app.js");
const sorted = require("jest-sorted");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const { formatComments } = require("../db/seeds/utils.js");
const { convertTimestampToDate } = require("../db/seeds/utils.js");
const { getReviewComments } = require("../controllers/reviews.controllers.js");

//for path and method error handling, see bottom

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return connection.end();
});

describe("GET /api/categories", () => {
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

describe("GET /api/reviews/:review_id", () => {
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
        expect(body.msg).toBe("Invalid Data Type Used");
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

describe("GET /api/reviews", () => {
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
        expect(body.msg).toBe("URL Does Not Exist or Method Not Allowed");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
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
          expect(comment).toHaveProperty("review_id", 2);
        });
        expect(reviewComments).toBeSortedBy("created_at", { descending: true });
      });
  });
  it('400: should return "Invalid Data Type Used" message for incorrect data type', () => {
    return request(app)
      .get("/api/reviews/Jenga/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
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
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("URL Does Not Exist or Method Not Allowed");
      });
  });
  it("200: No Comments - Returns empty array of comments for present review_id", () => {
    return request(app)
      .get("/api/reviews/5/comments")
      .expect(200)
      .then(({ body }) => {
        const { reviewComments } = body;
        expect(reviewComments).toEqual([]);
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  it("201: returns the new comment inserted, for current user", () => {
    const testComment = {
      username: "mallionaire",
      body: "lots of social deduction!",
    };

    return request(app)
      .post("/api/reviews/5/comments")
      .send(testComment)
      .expect(201)
      .then((response) => {
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.comment).toHaveProperty(
          "body",
          expect.any(String)
        );
        expect(response.body.comment).toHaveProperty(
          "author",
          expect.any(String)
        );
        expect(response.body.comment).toHaveProperty(
          "votes",
          expect.any(Number)
        );
        expect(response.body.comment).toHaveProperty("review_id", 5);
        expect(response.body.comment).toHaveProperty(
          "comment_id",
          expect.any(Number)
        );
        expect(response.body.comment).toHaveProperty(
          "created_at",
          expect.any(String)
        );
      });
  });
  it("400: returns 'User Does Not Exist' alert for username not in table", () => {
    const testComment = { username: "SpamBot", body: "This game sucks!" };
    return request(app)
      .post("/api/reviews/5/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("User Does Not Exist.");
      });
  });
  it("400: returns 'Missing Required Information' alert for null values in required fields", () => {
    const testComment = { username: "mallionaire", body: undefined };
    return request(app)
      .post("/api/reviews/5/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing Information Required");
      });
  });
  it('400: should return "Invalid Data Type Used" message for incorrect data type', () => {
    const testComment = {
      username: "mallionaire",
      body: "lots of fun!",
    };

    return request(app)
      .post("/api/reviews/Jenga/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  it("200: should return full review with updated votes by number provided in incVotes object", () => {
    const testIncVotes = { inc_votes: 10 };

    return request(app)
      .patch("/api/reviews/3")
      .send(testIncVotes)
      .expect(200)
      .then((response) => {
        const { review } = response.body;
        expect(review).toBeInstanceOf(Object);
        expect(review).toHaveProperty("review_id", 3);
        expect(review).toHaveProperty("title", expect.any(String));
        expect(review).toHaveProperty("designer", expect.any(String));
        expect(review).toHaveProperty("owner", expect.any(String));
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("review_body", expect.any(String));
        expect(review).toHaveProperty("category", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("votes", 15);
        expect(review.votes).toBe(15);
      });
  });
  it("400: returns error message if incVotes key is missing/null", () => {
    return request(app)
      .patch("/api/reviews/4")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("No Votes Provided");
      });
  });
  it('404: should return "Review Does Not Exist, Yet" for attempt to patch reviewID not in table', () => {
    const testIncVotes = { inc_votes: "10" };
    return request(app)
      .patch("/api/reviews/200")
      .send(testIncVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Review Does Not Exist, Yet.");
      });
  });
  it('400: should return "Invalid ID" for non numerical review_id', () => {
    const testIncVotes = { inc_votes: "10" };

    return request(app)
      .patch("/api/reviews/Jenga")
      .send(testIncVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
  it('400: should return "Invalid Data Type Used" for invalid votes data format', () => {
    const testIncVotes = { inc_votes: "Ten" };
    return request(app)
      .patch("/api/reviews/4")
      .send(testIncVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("204: should delete comment by ID and return No Content to Client", () => {
    const testFunc = (comment_id) => {
      return db
        .query(`SELECT * FROM comments WHERE comment_id = $1;`, [comment_id])
        .then((result) => result.rows);
    };

    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
        //testFunction result has 0 values
        expect(Object.values(testFunc(2))).toHaveLength(0);
      });
  });
  it('404: returns "Comment Does Not Exist, Yet." for delete request for commend_id not in table', () => {
    return request(app)
      .delete("/api/comments/200")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment Does Not Exist, Yet.");
      });
  });
  it('400: should return "Invalid Data Type Used" for non numerical comment_id', () => {
    return request(app)
      .delete("/api/comments/commentone")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
});

describe("GET /api/users", () => {
  it("200: returns array of users, each user is object with username, name and avatar_url key", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
  it("404: returns `URL does not exist` message for a mistyped path", () => {
    return request(app)
      .get("/api/uuuuusers")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("URL Does Not Exist or Method Not Allowed");
      });
  });
  it("405: returns `Method Not Allowed` message for a wrong method on this path", () => {
    return request(app)
      .delete("/api/users")
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).toBe("Method Not Allowed!");
      });
  });
});

describe("QUERIES CATEGORY /api/reviews", () => {
  it("200: returns reviews with Category specified in query ", () => {
    return request(app)
      .get("/api/reviews?category=dexterity")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toHaveLength(1);
        reviews.forEach((review) => {
          expect(review.category).toBe("dexterity");
        });
      });
  });
  it('404: responds "Category Does Not Exist" for valid category data type not in categories table', () => {
    return request(app)
      .get("/api/reviews?category=120")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Category Does Not Exist.");
      });
  });
  it("200: responds with array of ALL revieews if query is ommited/blank", () => {
    return request(app)
      .get("/api/reviews?category=")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13);
      });
  });
});

describe("SORT BY in /api/reviews", () => {
  it("200: sorts reviews returned by valid column", () => {
    return request(app)
      .get("/api/reviews?sort_by=category")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
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
        expect(reviews).toBeSortedBy("category", { ascending: true }); //ascending is default
      });
  });
  it("200: sorts reviews by date when no sort_by column given", () => {
    return request(app)
      .get("/api/reviews?sort_by=")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13);
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  it('400: returns "invalid sort query" for a column that is not permitted/possible', () => {
    return request(app)
      .get("/api/reviews?sort_by=review_img_url")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Sort Query");
      });
  });
  it('400: returns "invalid sort query" for a invalid data type in sort-by request', () => {
    return request(app)
      .get("/api/reviews?sort_by=C4T3G0RY")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Sort Query");
      });
  });
});
describe("General Errors/Issues Handling", () => {
  it('"404: returns a "route does not exist" message for mistyped path', () => {
    return request(app)
      .get("/api/catgories")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("URL Does Not Exist or Method Not Allowed");
      });
  });
  it("405: returns a 'method not allowed' message for restricted simple paths", () => {
    return request(app)
      .delete("/api/categories")
      .expect(405)
      .then(({ body }) => {
        expect(body.msg).toBe("Method Not Allowed!");
      });
  });
});
