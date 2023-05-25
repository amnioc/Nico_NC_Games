const { checkCategoryExists } = require("../models/categories.models.js");
const {
  fetchReviewById,
  fetchAllReviews,
  fetchReviewComments,
  checkReviewExists,
  insertReviewComment,
  changeReviewVotes,
  insertReview,
} = require("../models/reviews.models.js");
const { checkUserExists } = require("../models/users.models.js");

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

exports.addReview = (req, res, next) => {
  const newReview = req.body;
  insertReview(newReview)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getAllReviews = (req, res, next) => {
  const { category, sort_by, order, limit, p } = req.query;
  const allReviewsPromises = [
    fetchAllReviews(category, sort_by, order, limit, p),
  ];
  if (category) {
    allReviewsPromises.push(checkCategoryExists(category));
  }

  Promise.all(allReviewsPromises)
    .then(([reviews]) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewComments = (req, res, next) => {
  const { review_id } = req.params;
  const { limit, p } = req.query;
  const reviewPromises = [fetchReviewComments(review_id, limit, p)];
  if (review_id) {
    reviewPromises.push(checkReviewExists(review_id));
  }

  Promise.all(reviewPromises)
    .then(([reviewComments]) => {
      res.status(200).send({ reviewComments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addReviewComment = (req, res, next) => {
  const { review_id } = req.params;
  const newComment = req.body;
  const { username } = newComment;

  checkUserExists(username)
    .then(() => {
      return insertReviewComment(newComment, review_id);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateReviewVotes = (req, res, next) => {
  const { review_id } = req.params;
  const incVotes = req.body;
  const { inc_votes } = incVotes; //number to change by

  const reviewPromises = [
    changeReviewVotes(inc_votes, review_id),
    checkReviewExists(review_id),
  ];

  Promise.all(reviewPromises)
    .then(([review]) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};
