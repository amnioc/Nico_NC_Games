const { fetchAvailablePaths } = require("../models/api.models");

exports.getAvailablePaths = (req, res, next) => {
  fetchAvailablePaths()
    .then((paths) => {
      res.status(200).send({ paths });
    })
    .catch((err) => {
      next(err);
    });
};
