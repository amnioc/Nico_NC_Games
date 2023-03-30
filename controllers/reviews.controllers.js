const {
  fetchReviewById,
  fetchAllReviews,
  fetchReviewComments,
  checkReviewExists,
} = require("../models/reviews.models.js");

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;

  fetchReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllReviews = (req, res, next) => {
  fetchAllReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewComments = (req, res, next) => {
  const { review_id } = req.params;

  const reviewPromises = [fetchReviewComments(review_id)];
  if (review_id) {
    reviewPromises.push(checkReviewExists(review_id));
  }

  Promise.all(reviewPromises)
    .then((reviewComments) => {
      res.status(200).send({ reviewComments: reviewComments[0] });
    })
    .catch((err) => {
      next(err);
    });
};
