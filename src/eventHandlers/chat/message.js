const messageService = require("../../services/messageService");

const {uploadVoiceNote} = require("../../middlewares/AWS");

const {logThenEmit, createMessageData} = require("../utils/utilsFunc");

module.exports.sendMessage = function ({io, socket}) {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    try {
      const messageData = await createMessageData(payload, socket.userId);

      if (messageData.replyOn) {
        await messageService.checkChatOfMessage(
          messageData.replyOn,
          messageData.chatId
        );
      }
      const message = await messageService.createMessage(messageData);

      logThenEmit(
        socket.userId,
        "message:sent",
        {...message._doc},
        socket.broadcast.to(`chat:${payload.chatId}`)
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

      await messageService.updateMessageStatus(message.id, "sent");

      logThenEmit(
        socket.userId,
        "message:sent",
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
      payload.senderId = socket.userId;
      const message = await messageService.updateMessage(payload);
      logThenEmit(
        socket.userId,
        "message:updated",
        message,
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
        message,
        socket.broadcast.to(`chat:${message.chatId}`)
      );
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.sendVoiceNote = function ({io, socket}) {
  console.log("Testing Send voice");
  return async (payload) => {
    console.log("Inside Testing Send voice");

    const {file} = payload; // The audio file sent from the client
    console.log(file);
    try {
      const url = await uploadVoiceNote(file);
      console.log(url);
      socket.broadcast.emit("message:send_voicenote", url);
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};

module.exports.sendVoiceNote = function ({io, socket}) {
  console.log("Testing Send voice");
  return async (payload) => {
    console.log("Inside Testing Send voice");

    const {file} = payload; // The audio file sent from the client
    console.log(file);
    try {
      const url = await uploadVoiceNote(file);
      console.log(url);
      socket.broadcast.emit("message:send_voicenote", url);
    } catch (err) {
      socket.emit("error", {message: err.message});
    }
  };
};
