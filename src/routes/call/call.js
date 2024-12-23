const express = require("express");
const {
  getCalls,
  getCallsOfChat,
  joinCall,
} = require("../../controllers/call/call");
const isAuth = require("../../middlewares/isAuthenticated");

const router = express.Router();

router.get("/", isAuth, getCalls);
router.get("/:chatId", isAuth, getCallsOfChat);
router.post("/join/:callId", isAuth, joinCall);

module.exports = router;
