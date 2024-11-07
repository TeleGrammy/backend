const userService = require("../services/userService");
const AppError = require("../errors/appError");
const {
  sendMessage,
  updateMessageViewres,
  updateMessage,
  deleteMessage,
  forwardMessage,
  sendVoiceNote,
} = require("./chat/message");
const {updateTypingStatus} = require("./chat/typing");

const {uploadVoiceNote} = require("../middlewares/AWS");

exports.onConnection = async (socket, io) => {
  console.log("User connected:", socket.id);

  const userId = socket.user.id;

  socket.userId = userId;
  console.log("User id connected:", userId);
  socket.emit("message", "Hello from server MY NAGA");
  /* user will join all channels once connected so there will be not a join chat event */
  // user join it is own room
  socket.join(`${userId}`);

  const {contacts} = await userService.getUserByID(socket.userId);
  contacts.forEach((contact) => socket.join(`chat:${contact.chatId}`));

  socket.on("message:send", sendMessage({io, socket}));
  socket.on("message:update", updateMessage({io, socket}));
  socket.on("message:delete", deleteMessage({io, socket}));

  socket.on("message:seen", updateMessageViewres({io, socket}));

  socket.on("typing", updateTypingStatus({io, socket}));

  socket.on("message", (msg) => {
    console.log("Message from Client:", msg);
  });
  socket.on("message:send_voicenote", (payload, callback) => {
    console.log(
      "Received 'message:send_voicenote' event from client:",
      payload
    );

    // Acknowledge receipt if needed
    if (callback) {
      callback({status: "success", message: "Voice note received"});
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
