const {
  fetchAllCategories,
  insertCategory,
} = require("../models/categories.models.js");

exports.getAllCategories = (req, res, next) => {
  fetchAllCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addCategory = (req, res, next) => {
  const newCategory = req.body;
  insertCategory(newCategory).then((category) => {
    res.status(201).send({ category });
  });
};
