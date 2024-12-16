const express = require("express");

const router = express.Router();
const {
  muteNotification,
  unmuteNotification,
} = require("../../controllers/notification/notification");

router.patch("/mute", muteNotification);

router.patch("/unmute", unmuteNotification);
module.exports = router;
