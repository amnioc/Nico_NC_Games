const fs = require("fs/promises");

exports.fetchAvailablePaths = () => {
  return fs
    .readFile("./endpoints.json", "utf-8")
    .then((pathString, err) => {
      const parsedPaths = JSON.parse(pathString);
      return parsedPaths;
    })
    .catch((err) => {
      next(err);
    });
};
