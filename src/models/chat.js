const mongoose = require("mongoose");
const userModel = require("./user");
const channelMode = require("./channel");
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
  canDownload: {
    type: Boolean,
    default: true,
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

      await channelMode.findByIdAndUpdate(
        chat.channelId,
        {$inc: {membersCount: 1}}, // Increment membersCount by 1
        {new: true} // Return the updated document
      );
      console.log("pushing Channel to user");
      await userModel.findByIdAndUpdate(
        participantData.userId,
        {$addToSet: {channels: chat.channelId}}, // Use $push if duplicates are allowed
        {new: true} // Return the updated document
      );
    }
  }
  next();
});

chatSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  // Detect if a participant is being removed
  if (update?.$pull?.participants) {
    const participantData = update.$pull.participants; // The participant being removed
    const chat = await this.model.findOne(this.getQuery()); // Get the current chat document

    if (chat && chat.isChannel) {
      // Decrement membersCount in the channelMode collection
      await channelMode.findByIdAndUpdate(
        chat.channelId,
        {$inc: {membersCount: -1}}, // Decrement membersCount by 1
        {new: true} // Return the updated document
      );

      await userModel.findByIdAndUpdate(
        participantData.userId,
        {$pull: {channels: chat.channelId}}, // Remove the channelId from the user's channels array
        {new: true} // Return the updated document
      );
    }
  }
  next();
});
chatSchema.pre(/^find/, function (next) {
  // Only include documents where deleted is false
  this.where({deleted: false});
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
