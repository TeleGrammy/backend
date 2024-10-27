const router = require("express").Router();
const rateLimit = require("express-rate-limit");

const registrationController = require("../../controllers/auth/registration");

router.post("/register", registrationController.postRegistration);

router.post("/verfiy", registrationController.postVerfiy);

const resendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: "Too many resend requests, please try again later",
});

router.post(
  "/resend-verification",
  resendLimiter,
  registrationController.resendVerification
);

module.exports = router;
