const router = require("express").Router();
const {
  getChat,
  getChatById,
  getAllChats,
  fetchContacts,
} = require("../../controllers/chat/chat");

router.get("/chat/:id", getChatById);
router.get("/user-chat", getChat);
router.get("/all-chats", getAllChats);
router.post("/fetch-contacts", fetchContacts);

module.exports = router;
