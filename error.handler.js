const express = require("express");
const app = require("./app.js");

//mop-up errors
function SQLErrors(err, req, res, next) {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Data Type Used" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Missing Required Information" });
  } else if (err.code === "23503") {
    res.status(400).send({ msg: `Foreign Key Violation. ${err.detail}` });
  } else if (err.code === "42703") {
    res.status(400).send({ msg: "Query Value Does Not Exist" });
  } else {
    next(err);
  }
}
function CustomErrors(err, req, res, next) {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
}

function error500Handler(err, req, res, next) {
  console.log(err);
  res.status(500).send({ error: err });
}

module.exports = { error500Handler, SQLErrors, CustomErrors };
