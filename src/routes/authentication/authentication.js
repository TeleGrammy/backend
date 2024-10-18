const router = require("express").Router();

const {login} = require("../../controllers/auth/index");
const {
  signInWithGoogle,
  googleCallBack,
} = require("../../controllers/auth/googleAuthController");

router.get("/google", signInWithGoogle);
router.get("/google/secrets", googleCallBack);

router.post("/login", login);
module.exports = router;
