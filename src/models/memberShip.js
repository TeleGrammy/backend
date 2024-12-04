const mongoose = require("mongoose");

const {Schema} = mongoose;

const membershipSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
  entityId: {type: Schema.Types.ObjectId, required: true}, // Reference to either Group or Channel
  entityType: {
    type: String,
    enum: ["Group", "Channel"],
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Member", "Subscriber"],
    required: true,
  },
  joinedAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
});

const Membership = mongoose.model("Membership", membershipSchema);

module.exports = Membership;

