const {
  removeCommentById,
  updateCommentVotes,
} = require("../controllers/comments.controllers");

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:comment_id")
  .delete(removeCommentById)
  .patch(updateCommentVotes);

module.exports = commentsRouter;
