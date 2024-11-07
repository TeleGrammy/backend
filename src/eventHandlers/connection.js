const userService = require("../services/userService");
const AppError = require("../errors/appError");
const {
  sendMessage,
  updateMessageViewres,
  updateMessage,
  deleteMessage,
  forwardMessage,
} = require("./chat/message");
const {ackEvent, sendMissedEvents} = require("./event");
const {updateTypingStatus} = require("./chat/typing");

exports.onConnection = async (socket, io) => {
  console.log("User connected:", socket.id);

  socket.userId = socket.user.id;
  console.log("User id connected:", socket.userId);

  // user join it is own room
  socket.join(`${socket.userId}`);

  const user = await userService.getUserByID(socket.userId);
  await Promise.all(
    user.contacts.map(async (contact) => {
      socket.join(`chat:${contact.chatId}`);
      const offset = user.userChats.get(contact.chatId);

      await sendMissedEvents({
        io,
        userId: socket.userId,
        chatId: contact.chatId,
        offset,
      });
    })
  );

  socket.on("message:send", sendMessage({io, socket}));
  socket.on("message:update", updateMessage({io, socket}));
  socket.on("message:delete", deleteMessage({io, socket}));
  socket.on("message:seen", updateMessageViewres({io, socket}));
  socket.on("event:ack", ackEvent({io, socket}));
  socket.on("typing", updateTypingStatus({io, socket}));

  socket.on("message", (msg) => {
    console.log("Message from server:", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
