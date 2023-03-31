const db = require("../db/connection.js");
const { formatComments } = require("../db/seeds/utils.js");

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

exports.fetchAllReviews = () => {
  return db
    .query(
      `SELECT reviews.review_id, reviews.owner, reviews.title, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, CAST(COUNT(comments.review_id) AS int) AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id GROUP BY reviews.review_id ORDER BY reviews.created_at DESC;`
    )
    .then((result) => {
      return result.rows;
    });
};

exports.fetchReviewComments = (review_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC;`,
      [review_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.checkReviewExists = (id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1;`, [id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Review Does Not Exist, Yet.",
        });
      }
    });
};

exports.insertReviewComment = (newComment, review_id) => {
  const { username, body } = newComment;
  return db
    .query(
      `INSERT INTO comments (author, body, review_id) VALUES ($1, $2, $3) RETURNING *`,
      [username, body, review_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};
