const mongoose = require("mongoose");
const UserService = require("../services/userService");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");

const participantSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  joinedAt: {type: Date, default: Date.now},
  draft_message: {type: String, default: ""},
  role: {
    type: String,
    enum: ["Creator", "Admin", "Member", "Subscriber", "Peer"],
    default: "Member",
  },
  isMute: {
    type: Boolean,
    default: false,
  },
  lastMessageSeen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  unreadCount: {
    type: Number,
    default: 0,
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
  lastMessageTimestamp: {type: Date, default: () => new Date(1900, 0, 1)},
  deleted: {type: Boolean, default: false},
});

applySoftDeleteMiddleWare(chatSchema);

chatSchema.index({lastMessageTimestamp: -1});

chatSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.lastMessage) {
    update.lastMessageTimestamp = Date.now();
  }

  next();
});

// Pre-processing middleware (optional, for participantData modifications)
chatSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update?.$push?.participants) {
    const participantData = update.$push.participants; // The participant being added
    const chat = await this.model.findOne(this.getQuery()); // Get the current chat document

    if (chat && chat.isChannel) {
      // Perform async operation with userId and chat._id
      await UserService.pushChannelToUser(
        participantData.userId,
        chat.channelId
      );
    }
  }
  next();
});
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
