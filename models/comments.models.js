const db = require("../db/connection.js");

exports.deleteCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1;`, [comment_id])
    .then((result) => {
      return result.rows[0];
    });
};

exports.checkCommentExists = (id) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1;`, [id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment Does Not Exist, Yet.",
        });
      }
    });
};

exports.changeCommentVotes = (comment_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: "No Votes Provided",
    });
  }
  return db
    .query(
      `UPDATE comments SET votes = (votes + $1) WHERE comment_id = $2 RETURNING *`,
      [inc_votes, comment_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment Does Not Exist",
        });
      }
      return result.rows[0];
    });
};
