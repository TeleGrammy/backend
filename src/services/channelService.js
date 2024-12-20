const mongoose = require("mongoose");

const ChatService = require("./chatService");

const AppError = require("../errors/appError");

const Channel = require("../models/channel");

const Message = require("../models/message");

const createChannel = async (channelData) => {
  const newChannel = new Channel(channelData);

  return newChannel.save();
};

const getChannelInformation = async (channelId) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new AppError("Invalid channelId provided", 400);
  }
  return Channel.findOne({_id: channelId}).populate("ownerId");
};

const deleteChannel = async (channelId) => {
  return Channel.findOneAndUpdate(
    {_id: channelId},
    {deleted: true},
    {new: true}
  );
};

const updateChannelPrivacy = async (id, userId, updateData) => {
  const chat = await ChatService.getChatOfChannel(id);

  await ChatService.checkUserAdmin(chat.id, userId);
  const updatedChannel = await Channel.findByIdAndUpdate(
    id,
    {$set: updateData},
    {new: true} // Return the updated document
  );
  return updatedChannel;
};
/**
 * Get channel messages with embedded thread metadata
 * @param {String} channelId - The ID of the channel
 * @param {Number} page - The page number (default: 1)
 * @param {Number} limit - The number of messages per page (default: 10)
 * @returns {Object} - Channel details with messages and thread metadata
 */
const getChannelChatWithThreads = async (channelId, page = 1, limit = 20) => {
  try {
    // Validate the channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Get the associated chat for the channel
    const chat = await ChatService.getChatOfChannel(channelId);
    if (!chat) {
      throw new Error("Chat not found for this channel");
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch messages and thread metadata
    const messages = await Message.find({chatId: chat._id, isPost: true})
      .skip(skip) // Skip the documents for previous pages
      .limit(limit); // Limit the results to pageSize

    // Total message count for pagination
    const totalMessages = await Message.countDocuments({
      chatId: chat._id,
      isPost: true,
    });
    const totalPages = Math.ceil(totalMessages / limit);

    return {
      channelId: channel._id,
      channelName: channel.name,
      channelDescription: channel.description,
      chatId: chat._id,
      messages,
      pagination: {
        totalMessages,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching channel chat: ${error.message}`);
  }
};

/**
 * Get chat messages for a specific thread with pagination
 * @param {String} threadId - The ID of the thread
 * @param {Number} page - The page number (default: 1)
 * @param {Number} limit - The number of messages per page (default: 10)
 * @returns {Object} - Paginated messages and metadata
 */
const getThreadMessages = async (postId, userId, page = 1, limit = 20) => {
  // Validate the thread exists
  const post = await Message.findById(postId);
  if (!post) {
    throw new Error("Thread not found");
  }

  const chatId = post.chatId.toString();

  await ChatService.checkUserParticipant(chatId, userId);
  // Calculate pagination options
  const skip = (page - 1) * limit;

  // Query messages for the thread's associated chat
  const messages = await Message.find({parentPost: postId})
    .sort({createdAt: -1}) // Sort by newest first
    .skip(skip)
    .limit(limit);

  // Get total message count for the thread's chat
  const totalMessages = await Message.countDocuments({parentPost: postId});

  // Calculate total pages
  const totalPages = Math.ceil(totalMessages / limit);

  return {
    messages,
    pagination: {
      totalMessages,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const checkUserParticipant = async (channelId, userId) => {
  const chat = await ChatService.getChatOfChannel(channelId);
  console.log(userId, chat);
  const currentUser = chat.participants.find(
    (participant) => participant.userId._id.toString() === userId.toString()
  );

  if (!currentUser) {
    throw new AppError("User not found in the channel participants", 401);
  }
  return currentUser;
};

const checkCommentEnable = async (channelId) => {
  const channel = await getChannelInformation(channelId);
  if (!channel) {
    throw new AppError("Channl not Found", 404);
  }
  return channel.comments;
};

const searchChannel = async (filter, select, skip, limit, populatedOptions) => {
  const pipeline = [];
  pipeline.push({$match: filter});

  if (select) pipeline.push({$project: select});
  if (populatedOptions) pipeline.push({$lookup: populatedOptions});
  if (skip) pipeline.push({$skip: skip});
  if (limit) pipeline.push({$limit: limit});

  const query = Channel.aggregate(pipeline);
  return query;
};

module.exports = {
  createChannel,
  deleteChannel,
  getChannelInformation,
  getChannelChatWithThreads,
  getThreadMessages,
  checkUserParticipant,
  checkCommentEnable,
  updateChannelPrivacy,
  searchChannel,
};
