/* eslint-disable no-unused-vars */
const messageService = require("../../services/messageService");
const groupService = require("../../services/groupService");
const userService = require("../../services/userService");
const chatService = require("../../services/chatService");
const channelService = require("../../services/channelService");
const firebaseUtils = require("../../utils/firebaseMessaging");
const groupMessageHandlers = require("../utils/groupMessageHandlers");

const AIModelFactory = require("../../classes/AIModelFactory");
const AIInferenceContext = require("../../classes/AIInferenceContext");

const {
  logThenEmit,
  createMessageData,
  checkChannelRules,
} = require("../utils/utilsFunc");
const AppError = require("../../errors/appError");

module.exports.sendMessage = function ({io, socket}) {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    console.log("Sending message");
    try {
      const currentGroupChat = await chatService.retrieveGroupChatData(
        payload.chatId
      );

      if (currentGroupChat) {
        const obj = currentGroupChat._doc.groupId;
        const newObj = {...obj};
        const {applyFilter} = newObj._doc;
        if (applyFilter) {
          const factory = new AIModelFactory();

          let model_payload = {strategy: null, toBeClassified: null};
          if (payload.messageType === "text") {
            model_payload.strategy = factory.createStrategy("text");
            model_payload.toBeClassified = payload.content;
          } else if (payload.messageType === "image") {
            model_payload.strategy = factory.createStrategy("image");
            model_payload.toBeClassified = payload.mediaKey;
          }

          if (model_payload.strategy !== null) {
            try {
              const context = new AIInferenceContext(model_payload.strategy);
              const modelResult = await context.executeInference(
                model_payload.toBeClassified
              );

              if (modelResult === 1) {
                if (model_payload.toBeClassified === payload.content) {
                  payload.content = "******";
                } else {
                  payload.mediaKey = "template/explicit";
                }
              }
            } catch (err) {
              throw new AppError("AI Inference Error", 500);
            }
          }
        }
      }

      const messageData = await createMessageData(payload, socket.userId);
      if (messageData.replyOn) {
        await messageService.checkChatOfMessage(
          messageData.replyOn,
          messageData.chatId
        );
      }
      const {name} = socket.user;
      console.log(socket.user);
      await chatService.checkUserParticipant(messageData.chatId, socket.userId);
      const channelId = await chatService.checkChatChannel(messageData.chatId);
      if (channelId) {
        await checkChannelRules(socket.userId, channelId, messageData);
      }
      let message = await messageService.createMessage(messageData);
      if (!channelId || messageData.isPost) {
        chatService.updateLastMessage(messageData.chatId, message.id);
      }

      chatService.updateLastMessageCount(messageData.chatId, socket.userId);
      const chat = await chatService.getBasicChatById(messageData.chatId);
      let title = `A new Message from ${name}`;
      let body = "";
      let chatName = "";
      if (chat.isGroup) {
        const groupData = await groupService.findGroupById(chat.groupId);
        title = `A new Group Message from ${groupData.name}`;
        chatName = `Group: ${groupData.name}`;
      }
      if (chat.isChannel && messageData.isPost) {
        const channelData = await channelService.getChannelInformation(
          chat.channelId
        );
        title = `A new Channel Post from ${channelData.name}`;
        chatName = `Channel: ${channelData.name}`;
      }

      if (messageData.messageType === "text") {
        body = messageData.content;
      } else {
        body = messageData.messageType;
      }

      firebaseUtils.sendNotificationToTopic(
        `chat-${messageData.chatId}`,
        title,
        body
      );
      logThenEmit(
        socket.userId,
        "message:sent",
        {...message._doc},
        io.to(`chat:${payload.chatId}`)
      );

      // i think this is useless since at the event of new message
      // the user will have the mentions and can know if he is mentioned or not'
      message.mentions.forEach(async (userId) => {
        let newTitle = `${name} mentioned You`;
        if (chatName !== "") {
          newTitle = `${name} mentioned You in ${chatName}`;
        }
        firebaseUtils.sendNotificationToTopic(`user-${userId}`, newTitle, body);
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
          chatId: message.senderId._id,
        },
        io.to(`${message.senderId._id}`)
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
      await chatService.updateUserSeen(payload.chatId, socket.userId);
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
        io.to(`chat:${message.chatId._id}`)
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
      const msg = await messageService.getMessageById(payload.messageId);

      if (msg.chatId.isGroup) {
        const group = await groupService.findGroupById(msg.chatId.groupId);
        const canDeleteMessage = await groupMessageHandlers.canDeleteMessage(
          socket,
          msg.senderId._id,
          group
        );

        if (!canDeleteMessage) return;
        await messageService.deleteGroupMessage({_id: msg._id});

        const updatedPayload = {...payload, chatId: msg.chatId._id};

        logThenEmit(
          socket.userId,
          "message:deleted",
          updatedPayload,
          io.to(`chat:${updatedPayload.chatId}`)
        );
      } else {
        const message = await messageService.deleteMessage(
          payload.messageId,
          socket.userId
        );
        logThenEmit(
          socket.userId,
          "message:deleted",
          message._doc,
          io.to(`chat:${message.chatId._id}`)
        );
      }
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.updateDraftOfUserInChat = function ({io, socket}) {
  return async (payload, callback) => {
    try {
      await userService.updateDraftOfUserInChat(
        payload.chatId,
        socket.userId,
        payload.draft
      );

      if (callback) {
        callback({
          status: "ok",
          payload,
        });
      }
      io.to(`${socket.userId}`).emit("draft", payload);
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.pinMessage = function ({io, socket}) {
  return async (payload) => {
    try {
      const group = await groupService.findGroup({chatId: payload.chatId});

      if (group) {
        const canPinMessage = await groupMessageHandlers.canPinMessage(
          socket,
          group
        );
        if (!canPinMessage) return;
      }

      const message = await messageService.markMessageAsPinned(
        payload.chatId,
        payload.messageId
      );
      logThenEmit(
        socket.userId,
        "message:pin",
        {message, chatId: message.chatId._id, userId: socket.userId},
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
      const group = await groupService.findGroup({chatId: payload.chatId});

      if (group) {
        const canPinMessage = await groupMessageHandlers.canPinMessage(
          socket,
          group
        );
        if (!canPinMessage) return;
      }

      const message = await messageService.markMessageAsUnpinned(
        payload.chatId,
        payload.messageId
      );
      logThenEmit(
        socket.userId,
        "message:unpin",
        {message, chatId: message.chatId._id, userId: socket.userId},
        io.to(`chat:${payload.chatId}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};
