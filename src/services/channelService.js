const mongoose = require("mongoose");

const AppError = require("../errors/appError");

const Channel = require("../models/channel");

const createChannel = async (channelData) => {
  const newChannel = new Channel(channelData);

  return newChannel.save();
};

const getChannelInformation = async (channelId) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new AppError("Invalid channelId provided", 400);
  }
  return Channel.findOne({_id: channelId});
};

const deleteChannel = async (channelId) => {
  return Channel.findOneAndUpdate(
    {_id: channelId},
    {deleted: true},
    {new: true}
  );
};

module.exports = {
  createChannel,
  deleteChannel,
  getChannelInformation,
};
