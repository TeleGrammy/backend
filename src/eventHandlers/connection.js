const Message = require("../models/message");

exports.onConnection = async (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });
  socket.on("sendMessage", async (data) => {
    const {senderId, chatId, messageType, text, mediaUrl, duration, mentions} =
      data;

    // Save message to database
    const message = await new Message({
      senderId,
      chatId,
      messageType,
      text,
      mediaUrl,
      duration,
      mentions,
      status: "sent",
    }).save();

    // Emit to all users in the chat room
    io.to(chatId).emit("newMessage", message);
  });
};
