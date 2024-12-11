const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    callerIce: {
      type: [],
    },
    RecieverIce: {
      type: [],
    },
    callType: {
      type: String,
      enum: ["voice", "video"],
      default: "voice",
    },
    status: {
      type: String,
      enum: ["initiated", "answered", "missed", "rejected", "ended"],
      default: "initiated", // Initial status
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

callLogSchema.virtual("duration").get(function () {
  if (!this.startTime || !this.endTime) return 0;
  return Math.floor((this.endTime - this.startTime) / 1000);
});

callLogSchema.set("toJSON", {virtuals: true});
callLogSchema.set("toObject", {virtuals: true});

const Call = mongoose.model("Call", callLogSchema);

module.exports = Call;
