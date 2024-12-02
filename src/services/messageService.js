const Message = require("../models/message");
const Chat = require("../models/chat");
const AppError = require("../errors/appError");
const filterObject = require("../utils/utilitiesFunc");
const User = require("../models/user");
const {default: mongoose} = require("mongoose");
/**
 * Creates a new message.
 * @memberof Service.Message
 * @method createMessage
 * @async
 * @param {Object} messageData - Message information including senderId, chatId, messageType, etc.
 * @returns {Promise<Message|null>} - A promise that resolves to the created message if successful, otherwise null.
 */
module.exports.createMessage = async (messageData) => {
  const message = await Message.create(messageData);

  return message;
};

/**
 * Retrieves a message by its ID.
 * @memberof Service.Message
 * @method getMessageById
 * @async
 * @param {String} messageId - The ID of the message to retrieve.
 * @returns {Promise<Message|null>} - A promise that resolves to the message document if found, otherwise null.
 */
module.exports.getMessageById = async (messageId) => {
  const message = await Message.findById(messageId).populate(
    "senderId chatId mentions"
  );

  return message;
};

/**
 * Retrieves all messages for a specific chat.
 * @memberof Service.Message
 * @method getMessagesByChatId
 * @async
 * @param {String} chatId - The ID of the chat whose messages to retrieve.
 * @returns {Promise<Array<Message>|null>} - A promise that resolves to an array of messages if found, otherwise null.
 */
module.exports.getMessagesByChatId = async (chatId) => {
  const messages = await Message.find({chatId}).populate("senderId mentions");
  return messages;
};

module.exports.fetchChatMessages = (chatId, skip, limit) => {
  // Fetch messages related to this chat with pagination
  return Message.find({chatId: new mongoose.Types.ObjectId(chatId)})
    .sort({timestamp: -1}) // Sort messages by latest first
    .skip(skip)
    .limit(limit)
    .select(
      "content senderId messageType timestamp mediaUrl status mentions isEdited isForwarded replyOn mediaKey"
    ) // Only fetch relevant fields
    .populate("senderId mentions", "username"); // Populate sender details (only username)
};

module.exports.countChatMessages = (chatId) => {
  return Message.countDocuments({chatId: new mongoose.Types.ObjectId(chatId)});
};
/**
 * Updates the status of a message.
 * @memberof Service.Message
 * @method updateMessageStatus
 * @async
 * @param {String} messageId - The ID of the message to update.
 * @param {String} status - The new status of the message.
 * @returns {Promise<Message|null>} - A promise that resolves to the updated message if successful, otherwise null.
 */
module.exports.updateMessageStatus = async (messageId, status) => {
  const message = await Message.findByIdAndUpdate(
    messageId,
    {status},
    {new: true}
  );

  return message;
};

module.exports.updateChatViewers = async (chatId, messageId, viewerId) => {
  let message = await this.getMessageById(messageId);
  const lastMessageTimeStamp = message.timestamp;

  // Find all messages in the chat up to the last message timestamp
  const messages = await Message.find({
    chatId,
    timestamp: {
      $lte: lastMessageTimeStamp,
    },
  });

  // Retrieve the chat to get the number of participants
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  const numberOfMembers = chat.participants.length;

  // Update each message with the viewer information
  await Promise.all(
    messages.map(async (mes) => {
      await mes.updateMessageViewer(viewerId, numberOfMembers);
    })
  );

  message = await this.getMessageById(messageId);
  return message;
};
module.exports.updateMessageRecivers = async (
  chatId,
  messageId,
  recieverId
) => {
  let message = await this.getMessageById(messageId);
  const lastMessageTimeStamp = message.timestamp;

  // Find all messages in the chat up to the last message timestamp
  const messages = await Message.find({
    chatId,
    timestamp: {
      $lte: lastMessageTimeStamp,
    },
  });

  // Retrieve the chat to get the number of participants
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  const numberOfMembers = chat.participants.length;

  // Update each message with the viewer information
  await Promise.all(
    messages.map(async (mes) => {
      await mes.updateMessageRecivers(recieverId, numberOfMembers);
    })
  );

  message = await this.getMessageById(messageId);
  return message;
};

module.exports.updateMessage = async (payload) => {
  let message = await Message.findById(payload.messageId);

  if (message.senderId.toString() !== payload.senderId) {
    throw new AppError("You are not authorized to update this message", 403);
  }
  message = await Message.findByIdAndUpdate(
    payload.messageId,
    {
      content: payload.content,
      mentions: payload.mentions,
      isEdited: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  return message;
};

module.exports.deleteMessage = async (messageId, senderId) => {
  const message = await Message.findById(messageId);
  if (message.senderId.toString() !== senderId) {
    throw new AppError("You are not authorized to delete this message", 403);
  }
  await Message.findByIdAndDelete(messageId);
  return message;
};

module.exports.checkChatOfMessage = async (id, chatId) => {
  const message = await Message.findById(id);
  if (message.chatId.toString() !== chatId) {
    throw new AppError("Message is not part of the provided chat", 400);
  }
};

module.exports.createForwardMessageData = async (
  idOfMessageToForward,
  senderId,
  chatId
) => {
  const message = await Message.findById(idOfMessageToForward);
  const newMessageData = {
    senderId,
    chatId,
    messageType: message.messageType,
    content: message.content,
    isForwarded: true,
    forwardedFrom: message._id,
    mediaUrl: message.mediaUrl,
  };
  return newMessageData;
};
