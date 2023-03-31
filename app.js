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
} = require("./error.handler.js");
module.exports = app;

app.use(express.json());

const permittedMethods = ["GET", "POST", "PATCH"];

//returns categories with slug and desc
app.get("/api/categories", getAllCategories);

app.get("/api/reviews", getAllReviews);

app.get("/api/reviews/:review_id", getReviewById);

app.patch("/api/reviews/:review_id", updateReviewVotes);

app.post("/api/reviews/:review_id/comments", addReviewComment);

app.get("/api/reviews/:review_id/comments", getReviewComments);

//error handling below
app.use(SQLErrors);
app.use(CustomErrors);
app.use(error500Handler);

//any non-existent paths
app.use("*", (req, res, next) => {
  if (permittedMethods.includes(req.method) === false) {
    res.status(405).send({ msg: "Method Not Allowed!" });
  }
  res.status(404).send({ msg: "Route Does Not Exist" });
});
