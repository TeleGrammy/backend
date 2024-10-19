const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String
  },
  media: {
    type: String // URL to the media file
  },
  mediaKey: {
    type: String,
    select: false
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000 // 24 hour
  }
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
