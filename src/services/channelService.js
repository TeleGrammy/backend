const mongoose = require("mongoose");

const AppError = require("../errors/appError");

const Channel = require("../models/channel");

const Chat = require("../models/chat");

const Message = require("../models/message");

const createChannel = async (channelData) => {
  const newChannel = new Channel(channelData);

  return newChannel.save();
};

const getChannelInformation = async (channelId) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new AppError("Invalid channelId provided", 400);
  }
  return Channel.findOne({_id: channelId});
};

const deleteChannel = async (channelId) => {
  return Channel.findOneAndUpdate(
    {_id: channelId},
    {deleted: true},
    {new: true}
  );
};

/**
 * Get channel messages with embedded thread metadata
 * @param {String} channelId - The ID of the channel
 * @param {Number} page - The page number (default: 1)
 * @param {Number} limit - The number of messages per page (default: 10)
 * @returns {Object} - Channel details with messages and thread metadata
 */
const getChannelChatWithThreads = async (channelId, page = 1, limit = 10) => {
  try {
    // Validate the channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Get the associated chat for the channel
    const chat = await Chat.findOne({channelId: channel._id});
    if (!chat) {
      throw new Error("Chat not found for this channel");
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch messages and thread metadata
    const messages = await Message.aggregate([
      {$match: {chatId: chat._id}}, // Match messages for the channel's chat
      {$sort: {timestamp: -1}}, // Sort messages (newest first)
      {$skip: skip}, // Pagination: Skip documents
      {$limit: limit}, // Limit the number of documents
      {
        $lookup: {
          from: "threads", // Join with threads collection
          localField: "_id", // Match message ID to thread's messageId
          foreignField: "messageId",
          as: "thread", // Embed matching thread
        },
      },
      {
        $unwind: {
          path: "$thread",
          preserveNullAndEmptyArrays: true, // Allow messages without threads
        },
      },
      {
        $lookup: {
          from: "messages", // Join with messages collection to count thread messages
          localField: "thread.chatId", // Use thread's chatId to find messages
          foreignField: "chatId",
          as: "threadMessages",
        },
      },
      {
        $addFields: {
          threadId: "$thread._id", // Include thread ID
          comments: {$size: "$threadMessages"}, // Count messages in the thread
        },
      },
      {
        $project: {
          content: 1,
          messageType: 1,
          timestamp: 1,
          threadId: 1,
          comments: 1, // Include the count of thread messages
        },
      },
    ]);

    // Total message count for pagination
    const totalMessages = await Message.countDocuments({chatId: chat._id});
    const totalPages = Math.ceil(totalMessages / limit);

    return {
      channelId: channel._id,
      channelName: channel.name,
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

module.exports = {
  createChannel,
  deleteChannel,
  getChannelInformation,
  getChannelChatWithThreads,
};
