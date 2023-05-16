const express = require("express");
const cors = require("cors");
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

const apiRouter = require("./routes/api-router.js");
const categoriesRouter = require("./routes/categories-router.js");
const reviewsRouter = require("./routes/reviews-router.js");
// const categories = require("./routes/categories-router.js");
module.exports = app;

app.use(express.json());
app.use(cors());
app.use("/api", apiRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reviews", reviewsRouter);
// app.get("/api/reviews", getAllReviews);

// app.get("/api/reviews/:review_id", getReviewById);

// app.patch("/api/reviews/:review_id", updateReviewVotes);

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
