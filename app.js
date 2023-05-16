const express = require("express");
const cors = require("cors");
const app = express();
const {
  error500Handler,
  SQLErrors,
  CustomErrors,
} = require("./error.handler.js");
const apiRouter = require("./routes/api-router.js");
const categoriesRouter = require("./routes/categories-router.js");
const reviewsRouter = require("./routes/reviews-router.js");
const commentsRouter = require("./routes/comments-router.js");
const usersRouter = require("./routes/users-router.js");

app.use(express.json());
app.use(cors());

//routing
app.use("/api", apiRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

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

module.exports = app;
