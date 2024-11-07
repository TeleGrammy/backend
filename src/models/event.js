const mongoose = require("mongoose");
const AppError = require("../errors/appError");
const getNextId = require("../utils/snowFlakeID");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  index: {
    type: "String",
    required: true,
    unique: true,
    default: getNextId(),
  },
  payload: {
    type: Object,
  },
});
eventSchema.index({index: 1});
// eventSchema.pre("save", async function (next) {});
eventSchema.index({timeStamp: 1});
eventSchema.index({chatId: 1, timestamp: 1});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
