const mongoose = require("mongoose");
const {generateSignedUrl, deleteFile} = require("../middlewares/AWS");

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
  },
  media: {
    type: String, // URL to the media file,
    default: undefined,
  },
  mediaKey: {
    type: String,
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000, // 24 hour
  },
});

storySchema.methods.generateSignedUrl = async function () {
  try {
    if (this.mediaKey)
      this.media = await generateSignedUrl(this.mediaKey, 15 * 60);
  } catch (err) {
    console.error(`Error generating url for story ${doc._id}:`, err);
    this.media = null;
  }
};

storySchema.pre(/Delete$/, async function (next) {
  try {
    if (this.mediaKey) await deleteFile(this.mediaKey);
  } catch (err) {
    console.error(`Error deleting story ${this._id}:`, err);
  }
  next();
});
storySchema.post("save", async function (doc, next) {
  await this.generateSignedUrl();
  next();
});

// this middleware is responsible for creating signed URLs to the retreived stories from the database
storySchema.post(/^find/, async function (docs, next) {
  if (!docs || (Array.isArray(docs) && docs.length === 0)) next();

  if (!docs.length) {
    await docs.generateSignedUrl();
    docs.mediaKey = undefined;
  } else {
    await Promise.all(
      docs.map(async (doc) => {
        await doc.generateSignedUrl();
        doc.mediaKey = undefined;
      })
    );
  }
  next();
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
