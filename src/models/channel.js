const mongoose = require("mongoose");
const {Schema} = mongoose;

const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");

const AppError = require("../errors/appError");

const channelSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String},
  privacy: {type: String, enum: ["Public", "Private"], default: "Private"},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  metaDataPolicy: {
    type: String,
    enum: ["Admins", "EveryOne"],
    default: "Admins",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

channelSchema.post(/^find/, function (docs, next) {
  if (!docs || (Array.isArray(docs) && docs.length === 0)) {
    return next(new AppError("Chat not found", 404));
  }
  next();
});
applySoftDeleteMiddleWare(channelSchema);

const Channel = mongoose.model("Channel", channelSchema);

module.exports = Channel;
