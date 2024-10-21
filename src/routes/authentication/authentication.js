const router = require("express").Router();

const {login, logout} = require("../../controllers/auth/index");
const {
  signInWithGoogle,
  googleCallBack,
} = require("../../controllers/auth/googleAuthController");
const {
  signInWithGitHub,
  gitHubCallBack,
} = require("../../controllers/auth/githubAuthController");

const {
  facebookLogin,
  facebookCallback,
} = require("../../controllers/auth/facebookAuthController");

// eslint-disable-next-line import/order

router.get("/google", signInWithGoogle);
router.get("/google/secrets", googleCallBack);

router.get("/gitHub", signInWithGitHub);
router.get("/gitHub/secrets", gitHubCallBack);


router.get("/facebook", facebookLogin);

router.get("/facebook/callback", facebookCallback);

router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
