const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

sessionSchema.index({userId: 1}); // For fast search to the userId for the related session

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
