const router = require("express").Router();
const {
  getChat,
  getChatById,
  getAllChats,
  fetchContacts,
} = require("../../controllers/chat/chat");
const isAuthenticated = require("../../middlewares/isAuthenticated");

router.get("/chat/:id", isAuthenticated, getChatById);
router.get("/user-chat", isAuthenticated, getChat);
router.get("/all-chats", isAuthenticated, getAllChats);
router.post("/fetch-contacts", isAuthenticated, fetchContacts);

module.exports = router;
