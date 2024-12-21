const express = require("express");
// Docket build

const router = express.Router();
const {
  muteNotification,
  unmuteNotification,
} = require("../../controllers/notification/notification");
const isAuth = require("../../middlewares/isAuthenticated");

router.patch("/mute", isAuth, muteNotification);

router.patch("/unmute", isAuth, unmuteNotification);
module.exports = router;
