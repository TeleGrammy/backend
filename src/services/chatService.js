// chatService.js
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const AppError = require("../errors/appError");
const {addContact} = require("./userService");
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

const getBasicChatById = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId).select("-participants");

    return chat;
  } catch (error) {
    throw new Error(`Error retrieving chat: ${error.message}`);
  }
};
const updateChatMute = async (chatId, userId, muteStatus) => {
  // Step 1: Find the chat document
  const chat = await Chat.findOne({_id: chatId});

  if (!chat) {
    throw new AppError(`Chat not found`, 404);
  }

  // Step 2: Find the participant by userId and update `isMute`

  const participant = chat.participants.find(
    (p) => p.userId.toString() === userId
  );

  if (!participant) {
    throw new AppError(`Participant not found`, 404);
  }

  // Update the `isMute` field
  participant.isMute = muteStatus;

  // Save the updated chat document
  await chat.save();

  return chat;
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
        "name isGroup isChannel createdAt participants lastMessage groupId channelId lastMessageTimestamp isPinned"
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

const getFullUserChats = async (userId) => {
  try {
    const chats = await Chat.find(
      {"participants.userId": userId}, // Match chats where participants array contains the userId
      {participants: {$elemMatch: {userId}}} // Project only the matched element
    );
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
  console.log("Adding Participant");
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
      await addContact(userId1, chat.id, userId2, true);
      await addContact(userId2, chat.id, userId1, false);
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
    await addContact(userId1, chat.id, userId2, true);
    await addContact(userId2, chat.id, userId1, false);
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

  return chat;
};

const checkUserParticipant = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError("Chat not found", 404);
  }
  const currentUser = chat.participants.find(
    (participant) => participant.userId.toString() === userId
  );

  if (!currentUser) {
    throw new AppError("User not found in the chat participants", 401);
  }
  return currentUser;
};

const changeParticipantPermission = async (
  chatId,
  userId,
  canDownload = true
) => {
  const chat = await Chat.findById(chatId);
  const currentUserIndex = chat.participants.findIndex(
    (participant) => participant.userId.toString() === userId
  );
  if (currentUserIndex === -1) {
    throw new AppError("User not found in the chat participants", 401);
  }
  chat.participants[currentUserIndex].canDownload = canDownload;
  return chat.save();
};
const checkUserAdmin = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  const currentUser = chat.participants.find(
    (participant) => participant.userId.toString() === userId
  );

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

const retrieveGroupChatData = async (chatId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new AppError("Invalid chatId provided", 400);
  }

  return Chat.findById(chatId).where({isGroup: true}).populate({
    path: "groupId",
    select: "applyFilter",
  });
};
const updateUserSeen = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  chat.participants.forEach((part) => {
    if (part.userId.toString() === userId) {
      part.unreadCount = 0;
    }
  });
  await chat.save();
};

const updateLastMessageCount = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  chat.participants.forEach((part) => {
    if (part.userId.toString() !== userId) {
      part.unreadCount += 1;
    }
  });
  await chat.save();
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
  createOneToOneChat,
  countUserChats,
  getChatOfChannel,
  changeUserRole,
  checkUserParticipant,
  checkUserAdmin,
  checkChatChannel,
  removeChat,
  retrieveGroupChatData,
  getBasicChatById,
  getFullUserChats,
  updateChatMute,
  updateLastMessageCount,
  updateUserSeen,
  changeParticipantPermission,
};
