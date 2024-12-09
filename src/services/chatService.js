// chatService.js
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const Message = require("../models/message");
/**
 * Creates a new chat.
 * @memberof Service.Chat
 * @method createChat
 * @async
 * @param {Object} chatData - Chat information including participants, name, group, and channel details.
 * @returns {Promise<Chat|null>} - A promise that resolves to the created chat if successful, otherwise null.
 */

const createChat = async (chatData) => {
  try {
    const chat = new Chat(chatData);
    await chat.save();
    return chat;
  } catch (error) {
    throw new Error(`Error creating chat: ${error.message}`);
  }
};

/**
 * Retrieves a chat by its ID.
 * @memberof Service.Chat
 * @method getChatById
 * @async
 * @param {String} chatId - The ID of the chat to retrieve.
 * @returns {Promise<Chat|null>} - A promise that resolves to the chat document if found, otherwise null.
 */
const getChatById = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("lastMessage pinnedMessages")
      .populate({
        path: "participants.userId",
        select: "username email phone picture screenName lastSeen status",
      });

    return chat;
  } catch (error) {
    throw new Error(`Error retrieving chat: ${error.message}`);
  }
};

const getChatsByIds = async (chatIds) => {
  try {
    const chats = await Chat.find({_id: {$in: chatIds}});
    return chats;
  } catch (error) {
    throw new Error(`Error retrieving chats by IDs: ${error.message}`);
  }
};

/**
 * Retrieves all chats for a specific user.
 * @memberof Service.Chat
 * @method getUserChats
 * @async
 * @param {String} userId - The ID of the user whose chats to retrieve.
 * @returns {Promise<Array<Chat>|null>} - A promise that resolves to an array of chats if found, otherwise null.
 */
const getUserChats = async (userId, skip, limit) => {
  try {
    const chats = await Chat.find({"participants.userId": userId})
      .skip(skip)
      .limit(limit)
      .sort({createdAt: -1})
      .select(
        "name isGroup isChannel createdAt participants lastMessage pinnedMessages"
      )
      .populate(
        "participants.userId",
        "username email phone picture screenName lastSeen status"
      )
      .populate({
        path: "lastMessage",
        select: "content senderId messageType status timestamp mediaUrl",
        populate: {
          path: "senderId",
          select: "username",
        },
      })
      .populate({
        path: "pinnedMessages",
        select: "content senderId messageType status timestamp mediaUrl",
        populate: {
          path: "senderId",
          select: "username",
        },
      });
    return chats;
  } catch (error) {
    throw new Error(`Error retrieving user chats: ${error.message}`);
  }
};

const countUserChats = async (userId) => {
  try {
    const totalChats = await Chat.countDocuments({
      "participants.userId": userId,
    });

    return totalChats;
  } catch (error) {
    throw new Error(`Error counting user chats: ${error.message}`);
  }
};
/**
 * Updates the last message in a chat.
 * @memberof Service.Chat
 * @method updateLastMessage
 * @async
 * @param {String} chatId - The ID of the chat to update.
 * @param {String} messageId - The ID of the new last message.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const updateLastMessage = async (chatId, messageId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {lastMessage: messageId},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error updating last message: ${error.message}`);
  }
};

/**
 * Adds a participant to a chat.
 * @memberof Service.Chat
 * @method addParticipant
 * @async
 * @param {String} chatId - The ID of the chat to update.
 * @param {Object} participantData - Data of the participant to add.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const addParticipant = async (chatId, participantData) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {$push: {participants: participantData}},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error adding participant: ${error.message}`);
  }
};

/**
 * Removes a participant from a chat.
 * @memberof Service.Chat
 * @method removeParticipant
 * @async
 * @param {String} chatId - The ID of the chat to update.
 * @param {String} userId - The ID of the participant to remove.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const removeParticipant = async (chatId, userId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {$pull: {participants: {userId: mongoose.Types.ObjectId(userId)}}},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error removing participant: ${error.message}`);
  }
};

/**
 * Soft deletes a chat.
 * @memberof Service.Chat
 * @method softDeleteChat
 * @async
 * @param {String} chatId - The ID of the chat to soft delete.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const softDeleteChat = async (chatId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {deleted: true},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error soft deleting chat: ${error.message}`);
  }
};

/**
 * Restores a soft-deleted chat.
 * @param {String} chatId - The ID of the chat to restore.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const restoreChat = async (chatId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {deleted: false},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error restoring chat: ${error.message}`);
  }
};

/**
 * Pins a message in a chat.
 * @param {String} chatId - The ID of the chat to update.
 * @param {String} messageId - The ID of the message to pin.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const pinMessage = async (chatId, messageId) => {
  try {
    const message = await Message.findById(messageId);

    if (!message) throw new Error("Message not found");
    if (message.chatId !== chatId) {
      throw new Error("Message is not part of the provided chat");
    }
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {$addToSet: {pinnedMessages: messageId}},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error pinning message: ${error.message}`);
  }
};

/**
 * Unpins a message in a chat.
 * @param {String} chatId - The ID of the chat to update.
 * @param {String} messageId - The ID of the message to unpin.
 * @returns {Promise<Chat|null>} - A promise that resolves to the updated chat if successful, otherwise null.
 */
const unpinMessage = async (chatId, messageId) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {$pull: {pinnedMessages: messageId}},
      {new: true}
    );
    if (!chat) throw new Error("Chat not found");
    return chat;
  } catch (error) {
    throw new Error(`Error unpinning message: ${error.message}`);
  }
};

/**
 * Creates a one-to-one chat between two users if it doesn't already exist.
 * @param {String} userId1 - ID of the first user.
 * @param {String} userId2 - ID of the second user.
 * @returns {Promise<Chat>} - The existing or newly created chat.
 */
const createOneToOneChat = async (userId1, userId2) => {
  try {
    let chat = await Chat.findOne({
      participants: {
        $all: [
          {$elemMatch: {userId: new mongoose.Types.ObjectId(userId1)}},
          {$elemMatch: {userId: new mongoose.Types.ObjectId(userId2)}},
        ],
      },
      isGroup: false,
      isChannel: false,
    }).populate("participants.userId", "username email phone status");

    if (chat) return chat;

    chat = new Chat({
      participants: [
        {userId: userId1, joinedAt: new Date()},
        {userId: userId2, joinedAt: new Date()},
      ],
      isGroup: false,
      isChannel: false,
      createdAt: new Date(),
    });

    await chat.save();
    await chat.populate("participants.userId", "username email phone status");
    return chat;
  } catch (error) {
    throw new Error(`Error creating one-to-one chat: ${error.message}`);
  }
};

module.exports = {
  createChat,
  getChatById,
  getChatsByIds,
  getUserChats,
  updateLastMessage,
  addParticipant,
  removeParticipant,
  softDeleteChat,
  restoreChat,
  pinMessage,
  unpinMessage,
  createOneToOneChat,
  countUserChats,
};
