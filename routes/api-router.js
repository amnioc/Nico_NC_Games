const { getAvailablePaths } = require("../controllers/api.controller");

const apiRouter = require("express").Router();

apiRouter.get("/", getAvailablePaths);

module.exports = apiRouter;
