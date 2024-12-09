const mongoose = require("mongoose");

const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");

const ThreadSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  channelChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  chatId: {type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true}, // Reference to the thread's Chat document
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
});

applySoftDeleteMiddleWare(ThreadSchema);

const Thread = mongoose.model("Thread", ThreadSchema);

module.exports = Thread;
