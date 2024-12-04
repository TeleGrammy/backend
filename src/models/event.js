const mongoose = require("mongoose");

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
