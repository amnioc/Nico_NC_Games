const db = require("../db/connection.js");

exports.checkUserExists = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 400,
          msg: "User Does Not Exist.",
        });
      }
    });
};

exports.fetchAllUsers = () => {
  return db.query(`SELECT * FROM users`).then((result) => {
    return result.rows;
  });
};
