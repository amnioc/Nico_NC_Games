const express = require("express");
const app = express();
const { getAllCategories } = require("./controllers/categories.controllers.js");
const {
  error500Handler,
  SQLErrors,
  CustomErrors,
} = require("./error.handler.js");
module.exports = app;

//returns categories with slug and desc
app.get("/api/categories", getAllCategories);

//error handling below
app.use(SQLErrors);
app.use(CustomErrors);
app.use(error500Handler);

//any non-existent paths
app.use("*", (req, res, next) => {
  res.status(404).send({ msg: "Route Does Not Exist" });
});
