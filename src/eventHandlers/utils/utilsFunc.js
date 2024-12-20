const eventService = require("../../services/eventService");
const userService = require("../../services/userService");
const messageService = require("../../services/messageService");
const channelService = require("../../services/channelService");
const chatService = require("../../services/chatService");

module.exports.createMessageData = async (payload, userId) => {
  // check if the message is a forward message
  if (payload.isForwarded) {
    const messageData = await messageService.createForwardMessageData(
      payload.messageId,
      userId,
      payload.chatId
    );
    return messageData;
  }
  const messageData = {
    senderId: userId,
    chatId: payload.chatId,
    messageType: payload.messageType,
    content: payload.content || "",
    mentions: payload.mentions || [],
    replyOn: payload.replyOn || null,
    mediaUrl: payload.mediaUrl || "",
    mediaKey: payload.mediaKey || "",
    selfDestructTime: payload.selfDestructTime || undefined,
    isPost: payload.isPost || false,
    parentPost: payload.parentPost,
  };

  return messageData;
};

module.exports.checkChannelRules = async (userId, channelId, messageData) => {
  if (messageData.isPost) {
    await chatService.checkUserAdmin(messageData.chatId, userId);
  } else {
    const comments = await channelService.checkCommentEnable(channelId);
    if (!comments) {
      throw new Error("Comments is not allowed");
    }
    if (!messageData.parentPost) {
      throw new Error("Parent Post is not found");
    }
    await messageService.checkChannelPost(
      messageData.parentPost,
      messageData.chatId
    );
  }
};

module.exports.logThenEmit = async (userId, event, payload, sockets) => {
  const newEvent = await eventService.create({
    name: event,
    chatId: payload.chatId,
    payload,
  });
  console.log("SERVER EMITING ", event);
  const room = sockets.adapter.rooms.get(`chat:${payload.chatId}`);
  if (room) console.log("emitted to ", room.size, "users");
  sockets.emit(event, {...payload, eventIndex: newEvent.index});

  // update the last event acknoleged by the user in that chat
  await userService.ackEvent(userId, payload.chatId, newEvent.index);
};

module.exports.selectRequiredCallObject = async (call) => {
  if (
    call.callObjects[call.senderId.toString()] &&
    call.callObjects[call.senderId.toString()][call.recieverId.toString()]
  ) {
    call._doc.callObj =
      call.callObjects[call.senderId.toString()][call.recieverId.toString()];
  } else if (
    call.recieverId &&
    call.callObjects[call.recieverId.toString()] &&
    call.callObjects[call.recieverId.toString()][call.senderId.toString()]
  ) {
    call._doc.callObj =
      call.callObjects[call.recieverId.toString()][call.senderId.toString()];
  }
};

module.exports.appendIceCandidates = async (call, userId) => {
  if (
    call.callObjects[call.senderId.toString()] &&
    call.callObjects[call.senderId.toString()][call.recieverId.toString()]
  ) {
    if (userId === call.senderId.toString()) {
      call._doc.iceCandidates =
        call.callObjects[call.senderId.toString()][
          call.recieverId.toString()
        ].answererIceCandidates;
    } else {
      call._doc.iceCandidates =
        call.callObjects[call.senderId.toString()][
          call.recieverId.toString()
        ].offererIceCandidates;
    }
  } else if (
    call.recieverId &&
    call.callObjects[call.recieverId.toString()] &&
    call.callObjects[call.recieverId.toString()][call.senderId.toString()]
  ) {
    if (userId === call.recieverId.toString()) {
      call._doc.iceCandidates =
        call.callObjects[call.recieverId.toString()][
          call.senderId.toString()
        ].answererIceCandidates;
    } else {
      call._doc.iceCandidates =
        call.callObjects[call.recieverId.toString()][
          call.senderId.toString()
        ].offererIceCandidates;
    }
  }
};
