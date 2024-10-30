const Story = require("../models/story");

exports.create = async (data) => {
  const {userId, content, mediaKey} = data;
  return Story.create({userId, content, mediaKey});
};

exports.getStoriesByUserId = async (userId) => {
  return Story.find({userId, expiresAt: {$gte: Date.now()}});
};
exports.getStoryById = async (id) => {
  return Story.findOne({_id: id, expiresAt: {$gt: Date.now()}});
};

exports.deleteStoryById = async (id) => {
  return Story.findByIdAndDelete(id);
};
