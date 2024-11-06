const mongoose = require("mongoose");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");
const AppError = require("../errors/appError");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender ID is required"],
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: [true, "Chat ID is required"],
  },
  messageType: {
    type: String,
    enum: {
      values: [
        "text",
        "image",
        "audio",
        "voice_note",
        "document",
        "sticker",
        "GIF",
        "video",
        "file",
      ],
      message: "Message type is not valid",
    },
    required: [true, "Message type is required"],
  },
  replyOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
    default: undefined,
  },
  mentions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  viewers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  status: {
    type: String,
    enum: {
      values: ["sending", "delivered", "seen", "failed"],
      message: "Status is not valid",
    },
    default: "sending",
  },
  content: {
    type: String,
    default: "",
  },
  mediaUrl: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.methods.updateMessageViewer = async function (
  viewerId,
  numberOfMembersInChat
) {
  if (!this.viewers.includes(viewerId)) {
    this.viewers.push(viewerId);
  }

  if (this.viewers.length >= numberOfMembersInChat - 1) {
    this.status = "seen";
  }
  await this.save();
};

messageSchema.pre("save", function (next) {
  if (this.messageType === "text" && !this.content) {
    return next(new Error("Text message must have text content."));
  }

  if (
    [
      "image",
      "audio",
      "voice_note",
      "video",
      "sticker",
      "GIF",
      "document",
      "file",
    ].includes(this.messageType) &&
    !this.mediaUrl
  ) {
    return next(
      new Error(`${this.messageType} message must have a media URL.`)
    );
  }

  if (this.messageType === "audio" || this.messageType === "voice_note") {
    if (!this.duration) {
      return next(
        new Error(`${this.messageType} message must have a duration.`)
      );
    }
  }

  return next();
});

messageSchema.post(/^find/, (doc, next) => {
  if (!doc || (Array.isArray(doc) && doc.length === 0)) {
    throw new AppError("Message not found", 404);
  }

  next();
});
messageSchema.index({chatId: 1, timestamp: -1});

applySoftDeleteMiddleWare(messageSchema);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;

