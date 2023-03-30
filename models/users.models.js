const db = require("../db/connection.js");

exports.checkUserExists = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then((result) => {
      if (result.rowCount === 0) {
        return db.query(`INSERT INTO users (username, name) VALUES ($1, $2);`, [
          username,
          "NameTBC",
        ]);
      }
      console.log("user exists!");
    });
};
