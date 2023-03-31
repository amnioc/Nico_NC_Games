const {
  deleteCommentById,
  checkCommentExists,
} = require("../models/comments.models");

exports.removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  const commentPromises = [deleteCommentById(comment_id)];
  if (comment_id) {
    commentPromises.push(checkCommentExists(comment_id));
  }

  Promise.all(commentPromises)
    .then(([comment]) => {
      res.status(204).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
