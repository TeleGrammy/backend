// chatService.js
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const Message = require("../models/message");
const AppError = require("../errors/appError");
const UserService = require("./userService");
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
    const chat = await Chat.findById(chatId).populate("lastMessage").populate({
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
      .sort({lastMessageTimestamp: -1})
      .select(
        "name isGroup isChannel createdAt participants lastMessage groupId channelId lastMessageTimestamp"
      )
      .populate(
        "participants.userId",
        "username email phone picture screenName lastSeen status"
      )
      .populate("groupId", "name image description")
      .populate("channelId", "name image description")
      .populate({
        path: "lastMessage",
        select:
          "content senderId messageType status timestamp mediaUrl isPinned",
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
      {lastMessageTimestamp: Date.now()},
      {new: true}
    );
    console.log("updating Last Message: ", chat);
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
      {$pull: {participants: {userId: new mongoose.Types.ObjectId(userId)}}},
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

    if (chat) {
      await UserService.addContact(userId1, chat.id, userId2, true);
      await UserService.addContact(userId2, chat.id, userId1, false);
      return chat;
    }

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
    await UserService.addContact(userId1, chat.id, userId2, true);
    await UserService.addContact(userId2, chat.id, userId1, false);
    await chat.populate("participants.userId", "username email phone status");
    return chat;
  } catch (error) {
    throw new Error(`Error creating one-to-one chat: ${error.message}`);
  }
};

const getChatOfChannel = async (channelId) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new AppError("Invalid channelId provided", 400);
  }

  const chat = await Chat.findOne({
    channelId,
    isChannel: true,
    deleted: {$ne: true},
  })
    .populate("lastMessage")
    .populate("participants.userId");

  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  return chat;
};

const checkUserParticipant = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  const currentUser = chat.participants.find(
    (participant) => participant.userId.toString() === userId
  );

  if (!currentUser) {
    throw new AppError("User not found in the chat participants", 401);
  }
  return currentUser;
};

const checkUserAdmin = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  const currentUser = chat.participants.find(
    (participant) => participant.userId.toString() === userId
  );

  console.log(currentUser);
  if (!currentUser) {
    throw new AppError("User not found in the chat participants", 401);
  }
  if (currentUser.role !== "Admin" && currentUser.role !== "Creator") {
    throw new AppError("User not Authorized for the following operation", 401);
  }
  return currentUser;
};

const checkChatChannel = async (chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return false;
  }
  if (chat.isChannel) {
    return chat.channelId.toString();
  }
  return false;
};
const changeUserRole = async (chatId, userId, newRole) => {
  const validRoles = ["Admin", "Subscriber"];
  if (!validRoles.includes(newRole)) {
    throw new AppError("Invalid role", 400);
  }

  // Fetch the chat
  const currentChat = await Chat.findById(chatId);
  if (!currentChat) {
    throw new AppError("Chat not found", 404);
  }

  // Find the participant and update their role
  const participantIndex = currentChat.participants.findIndex(
    (p) => p.userId.toString() === userId
  );
  if (participantIndex === -1) {
    throw new AppError("User not found in chat participants", 404);
  }

  currentChat.participants[participantIndex].role = newRole;

  // Save the updated participants to the database
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {participants: currentChat.participants},
    {new: true, runValidators: true}
  );

  if (!updatedChat) {
    throw new AppError("Failed to update the chat", 500);
  }

  return updatedChat;
};

/**
 *
 * @param {String} chatId = The Chat Id which will be deleted from database
 * @returns
 */
const removeChat = (filter) => {
  return Chat.deleteOne(filter);
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
  // pinMessage,
  // unpinMessage,
  createOneToOneChat,
  countUserChats,
  getChatOfChannel,
  changeUserRole,
  checkUserParticipant,
  checkUserAdmin,
  checkChatChannel,
  removeChat,
};
