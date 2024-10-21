const router = require("express").Router();

const userController = require("../../controllers/user/user");
const isAuth = require("../../middlewares/isAuthenticated");

router.get("/", isAuth, userController.getMainPage);

module.exports = router;
