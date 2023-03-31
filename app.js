const express = require("express");
const app = express();
const { getAllCategories } = require("./controllers/categories.controllers.js");
const {
  getReviewById,
  getAllReviews,
  getReviewComments,
  addReviewComment,
  updateReviewVotes,
} = require("./controllers/reviews.controllers.js");
const {
  error500Handler,
  SQLErrors,
  CustomErrors,
  incorrectRequestHandler,
} = require("./error.handler.js");
const { removeCommentById } = require("./controllers/comments.controllers.js");
const { getAllUsers } = require("./controllers/users.controllers.js");
module.exports = app;

app.use(express.json());

//returns categories with slug and desc
app.get("/api/categories", getAllCategories);

app.get("/api/reviews", getAllReviews);

app.get("/api/reviews/:review_id", getReviewById);

app.patch("/api/reviews/:review_id", updateReviewVotes);

app.post("/api/reviews/:review_id/comments", addReviewComment);

app.get("/api/reviews/:review_id/comments", getReviewComments);

app.delete("/api/comments/:comment_id", removeCommentById);

app.get("/api/users", getAllUsers);

//error handling below
app.use(SQLErrors);
app.use(CustomErrors);
app.use(error500Handler);

const ValidPaths = ["/api/categories", "/api/reviews", "/api/users"];

//for methods/paths not listed
app.use("*", (req, res, next) => {
  if (ValidPaths.includes(req.originalUrl) === true) {
    res.status(405).send({ msg: "Method Not Allowed!" });
  }
  res.status(404).send({ msg: "URL Does Not Exist or Method Not Allowed" });
});
