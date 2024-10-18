const express = require("express");

const authenticationController = require("../controllers/authenticationController");

const router = express.Router();

router.post("/forget-password", authenticationController.forgetPassword);

router.patch("/reset-password/:token", authenticationController.resetPassword);

router.post(
  "/reset-password/resend",
  authenticationController.resendResetToken
);

module.exports = router;
