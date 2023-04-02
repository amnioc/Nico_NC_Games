const db = require("../db/connection.js");

exports.fetchAllCategories = () => {
  return db.query(`SELECT * FROM categories;`).then((result) => {
    return result.rows;
  });
};

exports.checkCategoryExists = (category) => {
  return db
    .query(`SELECT * FROM categories WHERE slug = $1;`, [category])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Category Does Not Exist.",
        });
      }
    });
};
