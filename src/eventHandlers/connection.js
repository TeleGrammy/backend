const userService = require("../services/userService");
const AppError = require("../errors/appError");
const {
  sendMessage,
  updateMessageViewres,
  updateMessage,
  deleteMessage,
} = require("./chat/message");
const {updateTypingStatus} = require("./chat/typing");
exports.onConnection = async (socket, io) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.id;

  socket.userId = userId;
  console.log("User id connected:", userId);

  /**  user will join all channels once connected so there will be not a join chat event */
  // user join it is own room
  socket.join(`${userId}`);
  const {contacts} = await userService.getUserByID(socket.userId);
  contacts.forEach((contact) => socket.join(`chat:${contact.chatId}`));

  socket.on("message:send", sendMessage({io, socket}));
  socket.on("message:update", updateMessage({io, socket}));
  socket.on("message:delete", deleteMessage({io, socket}));

  socket.on("message:seen", updateMessageViewres({io, socket}));

  socket.on("typing", updateTypingStatus({io, socket}));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
