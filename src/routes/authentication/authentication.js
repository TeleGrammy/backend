const {login, logout} = require("../../controllers/auth/index"),
  {
    signInWithGoogle,
    googleCallBack,
  } = require("../../controllers/auth/googleAuthController"),
  {
    signInWithGitHub,
    gitHubCallBack,
  } = require("../../controllers/auth/githubAuthController");

const router = require("express").Router();

router.get("/google", signInWithGoogle);
router.get("/google/secrets", googleCallBack);

router.get("/gitHub", signInWithGitHub);
router.get("/gitHub/secrets", gitHubCallBack);

router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
