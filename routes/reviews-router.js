const {
  getAllReviews,
  getReviewById,
  updateReviewVotes,
  addReviewComment,
  getReviewComments,
  addReview,
} = require("../controllers/reviews.controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getAllReviews).post(addReview);

reviewsRouter.route("/:review_id").get(getReviewById).patch(updateReviewVotes);

reviewsRouter
  .route("/:review_id/comments")
  .post(addReviewComment)
  .get(getReviewComments);

module.exports = reviewsRouter;
