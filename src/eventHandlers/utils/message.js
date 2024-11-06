const messageService = require("../../services/messageService");

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
  };

  return messageData;
};
