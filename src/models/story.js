const mongoose = require("mongoose");
const {generateSignedUrl, deleteFile} = require("../middlewares/AWS");
const {getBasicProfileInfo} = require("../services/userProfileService");

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewers: {
    type: Map,
    of: {
      type: new mongoose.Schema({
        viewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model
          required: true,
        },
        viewedAt: {
          type: Date,
          // Defaults to the time of viewing
        },
        profile: {
          type: Object,
          default: null,
        },
      }),
    },
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
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Corrected dynamic value
  },
});

storySchema.virtual("viewersCount").get(function () {
  return this.viewers ? this.viewers.size : 0;
});
storySchema.methods.generateSignedUrl = async function () {
  try {
    if (this.mediaKey)
      this.media = await generateSignedUrl(this.mediaKey, 15 * 60);
  } catch (err) {
    console.error(`Error generating url for story ${this._id}:`, err);
    this.media = null;
  }
  this.mediaKey = undefined;
};

storySchema.methods.appendViewersProfiles = async function () {
  if (this.viewers) {
    // Convert viewersIds to an array
    const viewerIds = Array.from(this.viewers.keys());

    await Promise.all(
      viewerIds.map(async (viewerId) => {
        const profile = await getBasicProfileInfo(viewerId);
        console.log(profile);
        const newValue = this.viewers.get(viewerId);
        newValue.profile = profile;

        this.viewers.set(viewerId, newValue);
      })
    );
  }
  return this;
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
  if (!docs || (Array.isArray(docs) && docs.length === 0)) {
    return next();
  }

  const documents = Array.isArray(docs) ? docs : [docs];

  await Promise.all(
    documents.map(async (doc) => {
      await doc.generateSignedUrl();
      await doc.appendViewersProfiles();
    })
  );

  next();
});

// Ensure virtuals are included in JSON and Object conversion
storySchema.set("toJSON", {virtuals: true});
storySchema.set("toObject", {virtuals: true});

storySchema.index({expiresAt: 1}, {expireAfterSeconds: 0});
const Story = mongoose.model("Story", storySchema);

module.exports = Story;
