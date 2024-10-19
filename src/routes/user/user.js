const userController = require("../../controllers/user/user");
const isAuth = require("../../middlewares/isAuthenticated");

const router = require("express").Router();

router.get("/", isAuth, userController.getMainPage);

module.exports = router;
