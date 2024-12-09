const Thread = require("../models/thread"); // Assuming Thread model is in models/Thread.js
const Message = require("../models/message"); // Assuming Message model is in models/Message.js

/**
 * Get chat messages for a specific thread with pagination
 * @param {String} threadId - The ID of the thread
 * @param {Number} page - The page number (default: 1)
 * @param {Number} limit - The number of messages per page (default: 10)
 * @returns {Object} - Paginated messages and metadata
 */
const getThreadMessages = async (threadId, page = 1, limit = 10) => {
  try {
    // Validate the thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Calculate pagination options
    const skip = (page - 1) * limit;

    // Query messages for the thread's associated chat
    const messages = await Message.find({chatId: thread.chatId})
      .sort({createdAt: -1}) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total message count for the thread's chat
    const totalMessages = await Message.countDocuments({chatId: thread.chatId});

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
  } catch (error) {
    throw new Error(`Error fetching thread messages: ${error.message}`);
  }
};

module.exports = {getThreadMessages};
