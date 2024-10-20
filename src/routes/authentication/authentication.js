const router = require("express").Router();

const {
  login,
  logout,
  accountRecovery,
} = require("../../controllers/auth/index");
const {
  signInWithGoogle,
  googleCallBack,
} = require("../../controllers/auth/googleAuthController");
const {
  signInWithGitHub,
  gitHubCallBack,
} = require("../../controllers/auth/githubAuthController");

const resendPasswordTokenLimiter = require("../../middlewares/resendPasswordTokenLimiter");

router.get("/google", signInWithGoogle);
router.get("/google/secrets", googleCallBack);

router.get("/gitHub", signInWithGitHub);
router.get("/gitHub/secrets", gitHubCallBack);

router.post("/login", login);
router.post("/logout", logout);

router.post("/forget-password", accountRecovery.forgetPassword);

router.post(
  "/reset-password/resend",
  resendPasswordTokenLimiter,
  accountRecovery.resendResetToken
);

router.patch("/reset-password/:token", accountRecovery.resetPassword);

module.exports = router;
