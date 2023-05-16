const {
  getAllReviews,
  getReviewById,
  updateReviewVotes,
} = require("../controllers/reviews.controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getAllReviews);

reviewsRouter.route("/:review_id").get(getReviewById).patch(updateReviewVotes);
module.exports = reviewsRouter;
