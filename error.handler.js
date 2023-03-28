const express = require("express");
const app = require("./app.js");

//mop-up errors
function SQLErrors(err, req, res, next) {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Data Format" });
  }
  next(err);
}
function CustomErrors(err, req, res, next) {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
}

function error500Handler(err, req, res, next) {
  res.status(500).send({ error: err });
}

module.exports = { error500Handler, SQLErrors, CustomErrors };

//valid path but not allowed category - to be completed
// res.status(405).send({ msg: "Method Not Allowed" });
