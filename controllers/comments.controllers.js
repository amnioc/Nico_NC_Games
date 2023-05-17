const {
  deleteCommentById,
  checkCommentExists,
  changeCommentVotes,
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

exports.updateCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body; //number to change votes by

  changeCommentVotes(comment_id, inc_votes)
    .then((comment) => {
      return res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
