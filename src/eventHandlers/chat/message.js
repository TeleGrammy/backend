/* eslint-disable no-unused-vars */
const messageService = require("../../services/messageService");
const userService = require("../../services/userService");
const chatService = require("../../services/chatService");
const channelService = require("../../services/channelService");
const {uploadVoiceNote} = require("../../middlewares/AWS");

const {
  logThenEmit,
  createMessageData,
  checkChannelRules,
} = require("../utils/utilsFunc");

module.exports.sendMessage = function ({io, socket}) {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    console.log("Sending message");
    try {
      const messageData = await createMessageData(payload, socket.userId);
      if (messageData.replyOn) {
        await messageService.checkChatOfMessage(
          messageData.replyOn,
          messageData.chatId
        );
      }
      await chatService.checkUserParticipant(messageData.chatId, socket.userId);
      const channelId = await chatService.checkChatChannel(messageData.chatId);
      if (channelId) {
        await checkChannelRules(socket.userId, channelId, messageData);
      }
      let message = await messageService.createMessage(messageData);
      if (!channelId || messageData.isPost) {
        chatService.updateLastMessage(messageData.chatId, message.id);
      }

      logThenEmit(
        socket.userId,
        "message:sent",
        {...message._doc},
        io.to(`chat:${payload.chatId}`)
      );

      // i think this is useless since at the event of new message
      // the user will have the mentions and can know if he is mentioned or not
      message.mentions.forEach((userId) => {
        io.to(`${userId}`).emit("message:mention", message);
      });

      // call the cb to acknowledge the message is sent to other users
      callback({
        status: "ok",
        data: {
          id: message.id,
        },
      });

      message = await messageService.updateMessageStatus(message.id, "sent");

      logThenEmit(
        socket.userId,
        "message:isSent",
        {
          message,
          chatId: message.senderId,
        },
        io.to(`${message.senderId}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.updateMessageViewres = function ({io, socket}) {
  return async (payload) => {
    try {
      const message = await messageService.updateChatViewers(
        payload.chatId,
        payload.messageId,
        socket.userId
      );

      logThenEmit(
        socket.userId,
        "message:seen",
        {chatId: `${message.senderId._id}`, message},
        io.to(`${message.senderId._id}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.updateMessage = function ({io, socket}) {
  return async (payload) => {
    try {
      // eslint-disable-next-line no-param-reassign
      payload.senderId = socket.userId;
      const message = await messageService.updateMessage(payload);
      logThenEmit(
        socket.userId,
        "message:updated",
        message._doc,
        io.to(`chat:${message.chatId}`)
      );
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
      logThenEmit(
        socket.userId,
        "message:deleted",
        message._doc,
        io.to(`chat:${message.chatId}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.updateDraftOfUserInChat = function ({io, socket}) {
  return async (payload) => {
    try {
      await userService.updateDraftOfUserInChat(
        payload.chatId,
        socket.userId,
        payload.draft
      );

      io.to(`${socket.userId}`).emit("draft", payload);
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.pinMessage = function ({io, socket}) {
  return async (payload) => {
    try {
      const message = await messageService.markMessageAsPinned(
        payload.chatId,
        payload.messageId
      );
      logThenEmit(
        socket.userId,
        "message:pin",
        {message, chatId: message.chatId, userId: socket.userId},
        io.to(`chat:${payload.chatId}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.unpinMessage = function ({io, socket}) {
  return async (payload) => {
    try {
      const message = await messageService.markMessageAsUnpinned(
        payload.chatId,
        payload.messageId
      );
      logThenEmit(
        socket.userId,
        "message:unpin",
        {message, chatId: message.chatId, userId: socket.userId},
        io.to(`chat:${payload.chatId}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};
