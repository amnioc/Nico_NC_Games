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

describe("POST /api/categories", () => {
  it("201: should return a category object with new topic details", () => {
    const testCategory = {
      slug: "thriller",
      description: "puts you on the edge of your seat!",
    };

    return request(app)
      .post("/api/categories")
      .send(testCategory)
      .expect(201)
      .then(({ body }) => {
        const { category } = body;
        expect(category).toBeInstanceOf(Object);
        expect(category).toMatchObject({
          slug: expect.any(String),
          description: expect.any(String),
        });
      });
  });
  it("400: should return Missing Required Information if sending empty required object field", () => {
    const testCategory = { description: "the best games" };

    return request(app)
      .post("/api/categories")
      .send(testCategory)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing Required Information");
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  it("200: returns an object with relevant properties related to review_id ", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toBeInstanceOf(Object);
        //removed Object keys length due to later feature
        expect(review).toBeInstanceOf(Object);
        expect(review).toHaveProperty("review_id", 2);
        expect(review).toHaveProperty(
          "review_body",
          "Fiddly fun for all the family"
        );
        expect(review).toHaveProperty("owner", "philippaclaire9");
        expect(review).toHaveProperty("title", "Jenga");
        expect(review).toHaveProperty("category", "dexterity");
        expect(review).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700"
        );
        expect(review).toHaveProperty("created_at", `2021-01-18T10:01:41.251Z`);
        expect(review).toHaveProperty("votes", 5);
        expect(review).toHaveProperty("designer", "Leslie Scott");
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
        expect(reviews).toHaveLength(10);
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
          expect(review).toHaveProperty("total_reviews", 13);
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

describe("POST /api/reviews", () => {
  it("201: should receive a review object and return new review with all fields", () => {
    const testReview = {
      owner: "philippaclaire9",
      title: "Pack of Cards",
      review_body: "It's a classic, the options are endless",
      designer: "unknown",
      category: "euro game",
      review_img_url:
        "https://plus.unsplash.com/premium_photo-1669825050501-b1d61e263df0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
    };

    return request(app)
      .post("/api/reviews")
      .send(testReview)
      .expect(201)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toBeInstanceOf(Object);
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review).toHaveProperty("title", "Pack of Cards");
        expect(review).toHaveProperty("owner", "philippaclaire9");
        expect(review).toHaveProperty(
          "review_body",
          "It's a classic, the options are endless"
        );
        expect(review).toHaveProperty("designer", "unknown");
        expect(review).toHaveProperty("category", "euro game");
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("votes", expect.any(Number));
        expect(review).toHaveProperty("comment_count", 0);
        expect(review).toHaveProperty("created_at", expect.any(String));
      });
  });
  it("201: should receive a review object without review_img_url and return new review with default url", () => {
    const testReview = {
      owner: "philippaclaire9",
      title: "Sushi Go",
      review_body: "Endless Fun",
      designer: "unknown",
      category: "euro game",
    };

    return request(app)
      .post("/api/reviews")
      .send(testReview)
      .expect(201)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toBeInstanceOf(Object);
        expect(review).toHaveProperty(
          "review_img_url",
          "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=700&h=700"
        ); //default from seed
      });
  });
  it("400: returns Foreign Key Violation when new review has owner not in user table", () => {
    const testReview = {
      owner: "gamer_rocks",
      title: "Sushi Go",
      review_body: "Endless Fun",
      designer: "unknown",
      category: "euro game",
    };

    return request(app)
      .post("/api/reviews")
      .send(testReview)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toContain("Foreign Key Violation");
      });
  });
  it("400: returns Missing Required Information when newReview is missing required information", () => {
    const testReview = {
      title: "Sushi Go",
      designer: "unknown",
      category: "euro game",
    };

    return request(app)
      .post("/api/reviews")
      .send(testReview)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing Required Information");
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

describe("PAGINATION of GET /api/reviews/:review_id/comments results", () => {
  it("200: returns limit number of comments when queried", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=2")
      .expect(200)
      .then(({ body }) => {
        const { reviewComments } = body;
        expect(reviewComments).toBeInstanceOf(Array);
        expect(reviewComments).toHaveLength(2); //test data has 3
        reviewComments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("review_id", expect.any(Number));
        });
      });
  });
  it("200: returns (up to 10) results by page query", () => {
    return request(app)
      .get("/api/reviews/2/comments?p=1")
      .expect(200)
      .then(({ body }) => {
        const { reviewComments } = body;
        expect(reviewComments).toHaveLength(3);
        reviewComments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("review_id", expect.any(Number));
        });
      });
  });
  it("200: returns empty page for page with no results", () => {
    return request(app)
      .get("/api/reviews/2/comments?p=2")
      .expect(200)
      .then(({ body }) => {
        const { reviewComments } = body;
        expect(reviewComments).toEqual([]);
      });
  });
  it("400: returns Query Value Does Not Exist for non-numerical limit", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=twenty")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Query Value Does Not Exist");
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
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toBeInstanceOf(Object);
        expect(comment).toHaveProperty("body", expect.any(String));
        expect(comment).toHaveProperty("author", expect.any(String));
        expect(comment).toHaveProperty("votes", expect.any(Number));
        expect(comment).toHaveProperty("review_id", 5);
        expect(comment).toHaveProperty("comment_id", expect.any(Number));
        expect(comment).toHaveProperty("created_at", expect.any(String));
      });
  });
  it("400: returns 'User Does Not Exist' alert for username not in table", () => {
    const testComment = { username: "SpamBot", body: "This game sucks!" };
    return request(app)
      .post("/api/reviews/5/comments")
      .send(testComment)
      .expect(404)
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
        expect(body.msg).toBe("Missing Required Information");
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

describe("DELETE /api/reviews/:review_id", () => {
  it("204: should delete review by ID and return No Content to Client", () => {
    return request(app)
      .delete("/api/reviews/5")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  it("404: should return Review Does Not Exist, Yet for ID that is not in table", () => {
    return request(app)
      .delete("/api/reviews/123")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Review Does Not Exist, Yet.");
      });
  });
  it("400: should return Invalid Data Type for non-numerical review_id  ", () => {
    return request(app)
      .delete("/api/reviews/ten")
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

describe("PATCH /api/comments/:comment_id", () => {
  it("200: should return updated comment with votes increased by incVotes value", () => {
    const votes = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/3")
      .send(votes)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toBeInstanceOf(Object);
        expect(comment).toHaveProperty("comment_id", 3);
        expect(comment).toHaveProperty("body", expect.any(String));
        expect(comment).toHaveProperty("review_id", expect.any(Number));
        expect(comment).toHaveProperty("author", expect.any(String));
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment.votes).toBe(11);
      });
  });
  it("200: should return updated comment with votes decreased by negative incVotes value", () => {
    const votes = { inc_votes: -3 };
    return request(app)
      .patch("/api/comments/4")
      .send(votes)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toBeInstanceOf(Object);
        expect(comment).toHaveProperty("comment_id", 4);
        expect(comment).toHaveProperty("body", expect.any(String));
        expect(comment).toHaveProperty("review_id", expect.any(Number));
        expect(comment).toHaveProperty("author", expect.any(String));
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment.votes).toBe(13);
      });
  });
  it("400: should return No Votes Provided for missing/null incVotes", () => {
    const votes = {};
    return request(app)
      .patch("/api/comments/5")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("No Votes Provided");
      });
  });
  it("400: should return Invalid Data Type Used for non numerical incVotes value", () => {
    const votes = { inc_votes: "three" };
    return request(app)
      .patch("/api/comments/4")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
  it("400: should return Invalid Data Type Used for non numerical comment_id", () => {
    const votes = { inc_votes: -2 };
    return request(app)
      .patch("/api/comments/two")
      .send(votes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
  it("404: should return Comment Does Not Exist for numerical comment_id not in table", () => {
    const votes = { inc_votes: 21 };
    return request(app)
      .patch("/api/comments/1250")
      .send(votes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment Does Not Exist");
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

describe("GET /api/users/:username", () => {
  it("200: returns a single user by username as object with username, name and avatar_url key", () => {
    return request(app)
      .get("/api/users/mallionaire")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toBeInstanceOf(Object);
        expect(user).toHaveProperty("username", "mallionaire");
        expect(user).toHaveProperty("name", expect.any(String));
        expect(user).toHaveProperty("avatar_url", expect.any(String));
      });
  });
  it("404: returns `User does not exist` message for a invalid username", () => {
    return request(app)
      .get("/api/users/true_gamer")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User Does Not Exist.");
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
        expect(reviews).toHaveLength(10);
        expect(reviews[0]).toHaveProperty("total_reviews", 13);
      });
  });
});

describe("SORT BY in /api/reviews", () => {
  it("200: sorts reviews returned by valid column", () => {
    return request(app)
      .get("/api/reviews?sort_by=designer")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toHaveLength(10);

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
          expect(review).toHaveProperty("total_reviews", 13);
        });
        expect(reviews).toBeSortedBy("designer", { descending: true }); //descending is default
      });
  });
  it("200: sorts reviews by date when no sort_by column given", () => {
    return request(app)
      .get("/api/reviews?sort_by=")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(10);
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  it('400: returns "invalid sort query" for a valid column that is not permitted/possible', () => {
    return request(app)
      .get("/api/reviews?sort_by=review_img_url")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Sort Query");
      });
  });
  it('400: returns "invalid sort query" for invalid data type in sort-by request', () => {
    return request(app)
      .get("/api/reviews?sort_by=C4T3G0RY")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Sort Query");
      });
  });
});

describe("ORDER asc/desc for sort_by queries on /api/reviews", () => {
  it("200: returns array of reviews in ascending order for specified colum", () => {
    return request(app)
      .get("/api/reviews?sort_by=category&&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(10);
        expect(reviews[0]).toHaveProperty("total_reviews", 13);
        expect(reviews).toBeSortedBy("category", { ascending: true });
      });
  });
  it("200: returns array of reviews in default of descending order when no order parameter present", () => {
    return request(app)
      .get("/api/reviews?sort_by=review_id")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toHaveLength(10);
        expect(reviews[0]).toHaveProperty("total_reviews", 13);
        expect(reviews).toBeSortedBy("review_id", { descending: true });
      });
  });
  it("200: default to reviews ordered by created_at, descending, when no sort_by or order parameters", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(10);
        expect(reviews[0]).toHaveProperty("total_reviews", 13);
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
  it('400: returns "Invalid Sort Query" when order provided invalid data-type', () => {
    return request(app)
      .get("/api/reviews?sort_by=categories&&order=12")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Sort Query");
      });
  });
});

describe("PAGINATION of GET /api/reviews results", () => {
  it("200: returns default of 10 results on page", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(10);
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
          expect(review).toHaveProperty("total_reviews", 13);
        });
      });
  });
  it("200: returns 5 results when limit is set", () => {
    return request(app)
      .get("/api/reviews?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toHaveLength(5);
        reviews.forEach((review) => {
          expect(review).toHaveProperty("total_reviews", 13);
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
      });
  });
  it("200: returns results by page specified", () => {
    return request(app)
      .get("/api/reviews?p=2") // 3 results
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(3);
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
          expect(review).toHaveProperty("total_reviews", 13);
        });
      });
  });
  it("200: returns No  Reviews Found for page with no results", () => {
    return request(app)
      .get("/api/reviews?p=3")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews.msg).toEqual("No Reviews Found");
      });
  });
  it("400: returns Query Value Does Not Exist for non-numerical limit", () => {
    return request(app)
      .get("/api/reviews?limit=twenty")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Query Value Does Not Exist");
      });
  });
});

describe("TOTAL COUNT returned from GET /api/reviews", () => {
  it("200: returns a total_reviews count, discounting page limit", () => {
    return request(app)
      .get("/api/reviews?sort_by=created_at&&limit=5")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(5); //page limit
        reviews.forEach((review) => {
          expect(review).toHaveProperty("total_reviews", 13);
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
      });
  });
});

describe('"/api/reviews" queries work together', () => {
  it("200: should return array of reviews when queried on valid category, sort_by and order", () => {
    return request(app)
      .get(
        "/api/reviews?category=social%20deduction&&?sort_by=review_id&&order=asc"
      )
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(10);
        reviews.forEach((review) => {
          expect(review).toHaveProperty("category", "social deduction");
          expect(review).toHaveProperty("total_reviews", 11);
        });
        expect(reviews).toBeSortedBy("review_id", { ascending: true });
      });
  });
});

describe("GET /api/reviews/:review_id (comment count included)", () => {
  it("200: returns review object including key/value pair for comment count", () => {
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
      comment_count: 3,
    };
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toBeInstanceOf(Object);
        expect(Object.keys(review).length).toBe(10);
        expect(review).toEqual(testObj);
        expect(review).toHaveProperty("comment_count", expect.any(Number));
        expect(review).toHaveProperty("review_id", expect.any(Number));
        expect(review).toHaveProperty("review_body", expect.any(String));
        expect(review).toHaveProperty("owner", expect.any(String));
        expect(review).toHaveProperty("title", expect.any(String));
        expect(review).toHaveProperty("category", expect.any(String));
        expect(review).toHaveProperty("review_img_url", expect.any(String));
        expect(review).toHaveProperty("created_at", expect.any(String));
        expect(review).toHaveProperty("votes", expect.any(Number));
        expect(review).toHaveProperty("designer", expect.any(String));
      });
  });
  it('400: returns "invalid data format" for non-numerical review_id', () => {
    return request(app)
      .get("/api/reviews/abc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Data Type Used");
      });
  });
  it("404: review does not exist. Returns error message", () => {
    return request(app)
      .get("/api/reviews/45")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Review Does Not Exist, Yet.");
      });
  });
});

describe("GET /api", () => {
  it("200: returns a JSON confirming all available enpoints on API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { paths } = body;
        expect(paths).toBeInstanceOf(Object);
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
