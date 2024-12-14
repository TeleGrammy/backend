const express = require("express");
const {body, validationResult} = require("express-validator");

const adminController = require("../../controllers/admin/admin");

const validationErrorCatcher = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const transformedErrors = errors.array().map((error) => ({
      errorType: error.type,
      message: error.msg,
    }));
    return res.status(400).json({status: "fail", errors: transformedErrors});
  }

  next();
};

const router = express.Router();

router.get("/users", adminController.getRegisteredUsers);

router.patch(
  "/users/:userId",
  [
    body("status")
      .exists()
      .withMessage("Status field is required")
      .isString()
      .withMessage("Status fiels should be a string")
      .notEmpty()
      .withMessage("Status field should not be empty"),
  ],
  validationErrorCatcher,
  adminController.changeUserStatus
);

router.get("/filter", adminController.filterContents);

module.exports = router;
