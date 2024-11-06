const messageService = require("../../services/messageService");
const {createMessageData} = require("../utils/message");

module.exports.sendMessage = function ({io, socket}) {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    try {
      const messageData = await createMessageData(payload, socket.userId);
      console.log(messageData);
      if (messageData.replyOn) {
        await messageService.checkChatOfMessage(
          messageData.replyOn,
          messageData.chatId
        );
      }
      const message = await messageService.createMessage(messageData);
      socket.broadcast
        .to(`chat:${payload.chatId}`)
        .emit("message:sent", message);

      // i think this is useless since at the event of new message
      // the user will have the mentions and can know if he is mentioned or not
      message.mentions.forEach((userId) => {
        io.to(`${userId}`).emit("message:mention", message);
      });

      callback({
        status: "ok",
        data: {
          id: message.id,
        },
      });

      // Update the message status to "sent" after acknowledgment
      await messageService.updateMessageStatus(message.id, "sent");
    } catch (err) {
      console.log(err);
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.updateMessageViewres = function ({io, socket}) {
  return async (payload) => {
    try {
      await messageService.updateChatViewers(
        payload.chatId,
        payload.messageId,
        socket.userId
      );

      socket.broadcast
        .to(`chat:${payload.chatId}`)
        .emit("message:seen", {...payload, viewerId: socket.userId});
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.updateMessage = function ({io, socket}) {
  return async (payload) => {
    try {
      payload.senderId = socket.userId;
      const message = await messageService.updateMessage(payload);

      io.to(`chat:${message.chatId}`).emit("message:updated", message);
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.deleteMessage = function ({io, socket}) {
  return async (payload) => {
    try {
      // we will make it delete from all the users
      const message = await messageService.deleteMessage(
        payload.messageId,
        socket.userId
      );
      socket.broadcast
        .to(`chat:${message.chatId}`)
        .emit("message:deleted", message);
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};
