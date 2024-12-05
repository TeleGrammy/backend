const mongoose = require("mongoose");
const {Schema} = mongoose;

const groupSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String},
  privacy: {type: String, enum: ["Public", "Private"], default: "Private"},
  sizeLimit: {type: Number, default: 1000}, // Maximum number of members
  addingMembersPolicy: {
    type: String,
    enum: ["EveryOne", "Admins"],
    default: "Admins",
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
