const db = require("../db/connection.js");

exports.fetchReviewById = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Review Does Not Exist, Yet.",
        });
      }
      return result.rows[0];
    });
};
