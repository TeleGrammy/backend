const express = require("express");
const {body, validationResult} = require("express-validator");

const searchController = require("../../controllers/search/search");

const validationErrorCatcher = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const transformedErrors = errors.array().map((error) => ({
      errorType: error.type || "validation",
      message: error.msg,
    }));
    return res.status(400).json({status: "fail", errors: transformedErrors});
  }
  next();
};

const router = express.Router();

router.get(
  "/messages",
  [
    body("searchText")
      .exists()
      .withMessage("Search Text field is required")
      .isString()
      .withMessage("Search Text field should be a string")
      .withMessage("Media Type must be one of text, image, video, or link"),

    body("mediaType")
      .optional()
      .isString()
      .withMessage("Media Type field should be a string")
      .isIn(["text", "image", "video", "link"]),

    body("limit")
      .optional()
      .isInt({min: 1})
      .withMessage("Limit Field should be a postitive integer"),

    body("skip")
      .optional()
      .isInt({min: 0})
      .withMessage("Skip field should be a non-negative integer"),
  ],
  validationErrorCatcher,
  searchController.searchForMatchedContents
);

module.exports = router;
