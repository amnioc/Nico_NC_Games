const express = require("express");
const app = require("./app.js");

//mop-up errors
function SQLErrors(err, req, res, next) {
  next(err);
}
function CustomErrors(err, req, res, next) {
  //valid path but not allowed category
  res.status(405).send({ msg: "Method Not Allowed" });
}

function error500Handler(err, req, res, next) {
  res.status(500).send({ error: err });
}

module.exports = { error500Handler, SQLErrors, CustomErrors };
