const AppError = require("../errors/appError");

const Channel = require("../models/channel");

const changeChannelsPolicy = async (channelIds, newPolicy) => {
  return await Channel.updateMany(
    {_id: {$in: channelIds}},
    {$set: {addingMembersPolicy: newPolicy}}
  );
};

module.exports = {
  changeChannelsPolicy,
};
