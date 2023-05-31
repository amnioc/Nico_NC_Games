const {
  getAllCategories,
  addCategory,
} = require("../controllers/categories.controllers");

const categoriesRouter = require("express").Router();

categoriesRouter.route("/").get(getAllCategories).post(addCategory);
//returns categories with slug and desc

module.exports = categoriesRouter;
