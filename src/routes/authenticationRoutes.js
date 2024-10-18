const express = require("express");

const authenticationController = require("../controllers/authenticationController");
const resendPasswordTokenLimiter = require("../middlewares/resendPasswordTokenLimiter");

const router = express.Router();

router.post("/forget-password", authenticationController.forgetPassword);

router.patch("/reset-password/:token", authenticationController.resetPassword);

router.post(
  "/reset-password/resend",
  resendPasswordTokenLimiter,
  authenticationController.resendResetToken
);

module.exports = router;
