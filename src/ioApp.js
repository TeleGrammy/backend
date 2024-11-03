const {Server} = require("socket.io");
const socketConfig = require("./config/socketConfig");
const Message = require("./models/message");

const createIoApp = (httpServer) => {
  const io = new Server(httpServer, socketConfig);
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    console.log("User connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("sendMessage", async (data) => {
      const {
        senderId,
        chatId,
        messageType,
        text,
        mediaUrl,
        duration,
        mentions,
      } = data;

      // Save to database
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

      // Emit to chat participants
      io.to(chatId).emit("newMessage", message);

      // Notify mentioned users
      mentions.forEach((userId) => {
        io.to(userId).emit("mentionedInMessage", {message, chatId});
      });
    });

    socket.on("messageDelivered", async ({messageId, chatId}) => {
      await Message.updateOne({_id: messageId}, {status: "delivered"});
      io.to(chatId).emit("messageStatusUpdate", {
        messageId,
        status: "delivered",
      });
    });

    socket.on("messageSeen", async ({messageId, chatId}) => {
      await Message.updateOne({_id: messageId}, {status: "seen"});
      io.to(chatId).emit("messageStatusUpdate", {messageId, status: "seen"});
    });

    socket.on("typing", ({chatId, userId}) => {
      socket.to(chatId).emit("userTyping", {userId, isTyping: true});
    });

    socket.on("stopTyping", ({chatId, userId}) => {
      socket.to(chatId).emit("userTyping", {userId, isTyping: false});
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = createIoApp;
