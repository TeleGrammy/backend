const Story = require("../models/story");
const User = require("../models/user");

exports.create = async (data) => {
  const {userId, content, mediaKey} = data;
  return Story.create({userId, content, mediaKey});
};

exports.getStoriesByUserId = async (userId) => {
  return Story.find({userId, expiresAt: {$gte: Date.now()}}).sort({
    expiresAt: -1,
  });
};
exports.getStoryById = async (id) => {
  return Story.findOne({_id: id, expiresAt: {$gt: Date.now()}});
};

exports.getStoriesOfContacts = async (id, page, limit) => {
  const {contacts} = await User.findById(id);
  return Story.find({
    userId: {$in: contacts},
    expiresAt: {$gte: Date.now()},
  })
    .sort({expiresAt: -1})
    .skip((page - 1) * limit)
    .limit(limit);
};
exports.deleteStoryById = async (id) => {
  return Story.findByIdAndDelete(id);
};

exports.updateStoryViewers = async (storyId, userId) => {
  return Story.findByIdAndUpdate(
    storyId,
    {
      $set: {[`viewers.${userId}`]: Date.now()},
    },
    {new: true, runValidators: true}
  );
};
