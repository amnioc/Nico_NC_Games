const { removeCommentById } = require("../controllers/comments.controllers");

const commentsRouter = require("express").Router();

commentsRouter.route("/:comment_id").delete(removeCommentById);

module.exports = commentsRouter;
