const mongoose = require("mongoose");

const {Schema} = mongoose;

const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");
const {generateSignedUrl} = require("../middlewares/AWS");

// const AppError = require("../errors/appError");

const channelSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String},
  image: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  privacy: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  metaDataPolicy: {
    type: String,
    enum: ["Admins", "EveryOne"],
    default: "Admins",
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The owner id is required."],
  },
  comments: {
    type: Boolean,
    default: true,
  },
  download: {
    type: Boolean,
    default: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  membersCount: {
    type: Number,
    default: 0,
  },
  inviteToken: {
    type: String,
  },
});

// channelSchema.post(/^find/, function (docs, next) {
//   if (!docs || (Array.isArray(docs) && docs.length === 0)) {
//     return next(new AppError("Chat not found", 404));
//   }
//   return next();
// });

channelSchema.methods.generateSignedUrl = async function () {
  try {
    if (this.image) {
      this.imageUrl = await generateSignedUrl(this.image, 24 * 60 * 60);
    }
  } catch (err) {
    console.error(`Error generating url for story ${this._id}:`, err);
    this.imageUrl = null;
  }
};

channelSchema.post(/^find/, async function (docs, next) {
  if (!docs || (Array.isArray(docs) && docs.length === 0)) {
    return next();
  }

  const documents = Array.isArray(docs) ? docs : [docs];
  await Promise.all(
    documents.map(async (doc) => {
      await doc.generateSignedUrl();
    })
  );

  return next();
});
channelSchema.pre(/^find/, function (next) {
  // Only include documents where deleted is false
  this.where({deleted: false});
  next();
});

applySoftDeleteMiddleWare(channelSchema);

const Channel = mongoose.model("Channel", channelSchema);

module.exports = Channel;
