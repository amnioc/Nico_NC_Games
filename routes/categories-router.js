const { getAllCategories } = require("../controllers/categories.controllers");

const categoriesRouter = require("express").Router();

categoriesRouter.get("/", getAllCategories);
//returns categories with slug and desc

module.exports = categoriesRouter;
