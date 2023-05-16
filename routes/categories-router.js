const { getAllCategories } = require("../controllers/categories.controllers");

const categoriesRouter = require("express").Router();

categoriesRouter.get("/", getAllCategories);

module.exports = categoriesRouter;
