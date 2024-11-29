const router = require("express").Router();
const isAuthenticated = require("../../middlewares/isAuthenticated");

const userController = require("../../controllers/user/user");

router.post("/public-key", isAuthenticated, userController.updatePublicKey);
router.get("/", isAuthenticated, userController.getMainPage);

module.exports = router;
