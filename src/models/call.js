const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    participants: [
      // assume first participant is the caller
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    callObj: {
      offer: {
        type: Object,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      answer: {
        type: Object,
        default: null,
      },
      participantICE: {
        type: Object,
        default: null,
      },
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    participantsWhoRejected: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    status: {
      type: String,
      enum: ["ongoing", "rejected", "missed", "ended"],
      default: "ongoing",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

callSchema.virtual("duration").get(function () {
  if (this.endedAt && this.startedAt) {
    return this.endedAt.getTime() - this.startedAt.getTime();
  }
  return 0;
});

callSchema.pre(/^find/, function (next) {
  this.populate({
    path: "chatId",
    select: "_id isGroup isChannel participants.userId groupId channelId",
    populate: [
      {
        path: "participants.userId",
        select: "_id username picture",
      },
      {
        path: "groupId",
        select: "_id image name",
      },
      {
        path: "channelId",
        select: "_id image name",
      },
    ],
  });

  next();
});

callSchema.set("toJSON", {virtuals: true});
callSchema.set("toObject", {virtuals: true});

const Call = mongoose.model("Call", callSchema);

module.exports = Call;
