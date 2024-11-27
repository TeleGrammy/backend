const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String},
  privacy: {type: String, enum: ["Public", "Private"], default: "Public"},
  sizeLimit: {type: Number, default: 1000000}, // Maximum number of subscribers
  addingMembersPolicy: {
    type: String,
    enum: ["EveryOne", "Admins"],
    default: "Admins",
  },
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
});

const Channel = mongoose.model("Channel", channelSchema);

module.exports = Channel;
