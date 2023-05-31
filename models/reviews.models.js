const format = require("pg-format");
const db = require("../db/connection.js");

exports.fetchReviewById = (review_id) => {
  return db
    .query(
      `SELECT reviews.*, CAST(COUNT(comments.review_id) AS int) AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE reviews.review_id = $1 GROUP BY reviews.review_id;`,
      [review_id]
    )
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

exports.fetchAllReviews = (category, sort_by, order, limit, p) => {
  let selectReviewsString = `SELECT reviews.review_id, reviews.owner, reviews.title, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, CAST(COUNT(comments.review_id) AS int) AS comment_count, CAST(COUNT(*) OVER() AS int) AS total_reviews FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id`;
  const queryParameters = [];

  if (
    sort_by &&
    ![
      "review_id",
      "owner",
      "title",
      "category",
      "created_at",
      "votes",
      "designer",
      "comment_count",
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, msg: "Invalid Sort Query" });
  }

  if (category) {
    selectReviewsString += ` WHERE reviews.category = $1 GROUP BY reviews.review_id`;
    queryParameters.push(category);
  } else if (category && sort_by) {
    selectReviewsString += ` ORDER BY reviews.${sort_by}`;
  } else if (!category && sort_by) {
    selectReviewsString += ` GROUP BY reviews.review_id ORDER BY reviews.${sort_by}`;
  }

  if (sort_by && order === "asc") {
    selectReviewsString += ` ASC`;
  } else if (sort_by) {
    selectReviewsString += ` DESC`; //DEFAULT
  }

  if (!category && !sort_by && !order) {
    const finishingString = ` GROUP BY reviews.review_id ORDER BY reviews.created_at DESC`;
    selectReviewsString += finishingString;
  } else if (category && !sort_by && !order) {
    selectReviewsString += ` ORDER BY reviews.created_at DESC`;
  }

  limit
    ? (selectReviewsString += ` LIMIT ${limit}`)
    : (selectReviewsString += ` LIMIT 10`);

  if (p) {
    queryParameters.push((limit || 10) * (parseInt(p) - 1));
    selectReviewsString += ` OFFSET $1`;
  }

  return db.query(selectReviewsString, queryParameters).then((result) => {
    if (result.rowCount === 0) {
      return Promise.resolve({
        status: 200,
        msg: "No Reviews Found",
      });
    }
    return result.rows;
  });
};

exports.fetchReviewComments = (review_id, limit, p) => {
  let selectCommentsString = `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC`;

  const queryParameters = [review_id];

  limit
    ? (selectCommentsString += ` LIMIT ${limit}`)
    : (selectCommentsString += ` LIMIT 10`);

  if (p) {
    queryParameters.push((limit || 10) * parseInt(p - 1));
    selectCommentsString += ` OFFSET $2`;
  }

  return db.query(selectCommentsString, queryParameters).then((result) => {
    if (result.rows === 0) {
      return Promise.resolve({
        status: 200,
        msg: "No More Comments Found",
      });
    }
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

exports.changeReviewVotes = (inc_votes, review_id) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: "No Votes Provided",
    });
  }

  return db
    .query(
      "UPDATE reviews SET votes = (votes + $1) WHERE review_id = $2 RETURNING *;",
      [inc_votes, review_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.insertReview = (newReview) => {
  const preparedReview = formattedReview(newReview);

  function formattedReview(newReview) {
    return [newReview].map((review) => {
      if (review.review_img_url) {
        return [
          review.owner,
          review.title,
          review.review_body,
          review.designer,
          review.category,
          review.review_img_url,
        ];
      }

      return [
        review.owner,
        review.title,
        review.review_body,
        review.designer,
        review.category,
      ];
    });
  }
  const insertQueryString = format(
    `INSERT INTO reviews (owner, title, review_body, designer, category) VALUES %L RETURNING * ;`,
    preparedReview
  );
  const insertPictureQuery = format(
    `INSERT INTO reviews (owner, title, review_body, designer, category, review_img_url) VALUES %L RETURNING * ;`,
    preparedReview
  );

  return db
    .query(newReview.review_img_url ? insertPictureQuery : insertQueryString)
    .then((result) => {
      const id = result.rows[0].review_id;
      return this.fetchReviewById(id);
    })
    .then((review) => {
      return review;
    });
};
