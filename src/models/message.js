const mongoose = require("mongoose");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");

const messageSchema = new mongoose.Schema({
  senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  chatId: {type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true},
  messageType: {
    type: String,
    enum: [
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
    required: true,
  },
  duration: {type: Number},
  mentions: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  status: {
    type: String,
    enum: ["sending", "sent", "delivered", "seen", "failed"],
    required: true,
    default: "sending",
  },
  text: {type: String},
  mediaUrl: {type: String},
  timestamp: {type: Date, default: Date.now},
});

messageSchema.pre("save", function (next) {
  if (this.messageType === "text" && !this.text) {
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

messageSchema.index({chatId: 1, timestamp: -1});

applySoftDeleteMiddleWare(messageSchema);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
