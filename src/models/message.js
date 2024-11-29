const mongoose = require("mongoose");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");

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
  isForwarded: {
    type: Boolean,
    default: false,
  },
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
  isEdited: {
    type: Boolean,
    default: false,
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
  recievers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  status: {
    type: String,
    enum: {
      values: ["sending", "sent", "delivered", "seen", "failed"],
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
  selfDestructTime: {type: Number}, // Time-to-live in seconds
  expiresAt: {type: Date}, // Exact expiration time for TTL
});

messageSchema.pre("save", function (next) {
  if (this.selfDestructTime) {
    this.expiresAt = new Date(
      this.timestamp.getTime() + this.selfDestructTime * 1000
    );
  }
  next();
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

messageSchema.methods.updateMessageRecivers = async function (
  recieverId,
  numberOfMembersInChat
) {
  if (!this.recievers.includes(recieverId)) {
    this.recievers.push(recieverId);
  }
  if (this.recievers.length >= numberOfMembersInChat - 1) {
    this.status = "delivered";
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

  return next();
});

messageSchema.post(/^find/, (doc, next) => {
  next();
});

// messageSchema.post("remove", function (doc) {
//   // TODO: put proper socket path and test this socket
//   // const io = require("SOCKET PATH");
//   // io.of("/messages").to(doc.chatId.toString()).emit("messageDeleted", {
//   //   messageId: doc._id,
//   //   chatId: doc.chatId,
//   // });
//   // console.log(`Notification sent for deleted message: ${doc._id}`);
// });

messageSchema.index({chatId: 1, timestamp: -1});

messageSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

applySoftDeleteMiddleWare(messageSchema);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
