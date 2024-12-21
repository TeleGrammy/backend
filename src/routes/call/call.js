const express = require("express");
const {getCalls, getCallsOfChat} = require("../../controllers/call/call");
const isAuth = require("../../middlewares/isAuthenticated");

const router = express.Router();

router.get("/", isAuth, getCalls);
router.get("/:chatId", isAuth, getCallsOfChat);

module.exports = router;
