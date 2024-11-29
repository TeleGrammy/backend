const mongoose = require("mongoose");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");
const AppError = require("../errors/appError");

const participantSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  joinedAt: {type: Date, default: Date.now},
  draft_message: {type: String, default: ""},
  role: {
    type: String,
    enum: ["Creator", "Admin", "Member","Subscriber", "Peer"],
    required: true,
  },
});

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  participants: [participantSchema],
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupId: {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
  isChannel: {
    type: Boolean,
    default: false,
  },
  channelId: {type: mongoose.Schema.Types.ObjectId, ref: "Channel"},
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastMessage: {type: mongoose.Schema.Types.ObjectId, ref: "Message"},
  pinnedMessages: [{type: mongoose.Schema.Types.ObjectId, ref: "Message"}],
  deleted: {type: Boolean, default: false},
});

applySoftDeleteMiddleWare(chatSchema);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
