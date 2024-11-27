const router = require("express").Router();
const chatController = require("../../controllers/chat/chat");

router.get("/get-chat", chatController.getChat);
module.exports = router;
