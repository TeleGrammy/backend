const mongoose = require("mongoose");

const AppError = require("../errors/appError");

const User = require("../models/user");
const Group = require("../models/groupModel");

const getUsers = async (adminId) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new AppError("Invalid adminId provided", 400);
  }
  console.log("here")

  return await User.find({_id: {$ne: adminId}, status: {$ne: "banned"}})
    .select("username screenName phone email bio status pictureKey picture")
    .exec();
};

const getGroups = async () => {
  const groups = await Group.find()
    .select(
      "name description image groupType groupPermissions addUsers pinMessages changeChatInfo applyFilter"
    )
    .populate({
      path: "ownerId",
      select: "username screenName phone email _id",
    });

  return groups.map((group) => {
    group = group.toObject();
    group.owner = group.ownerId;
    delete group.ownerId;
    return group;
  });
};

const restrictUser = async (userId, newData, options) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid userId provided", 400);
  }

  return User.findByIdAndUpdate(userId, newData, options).select(
    "username screenName phone email bio status pictureKey picture"
  );
};

module.exports = {
  getUsers,
  getGroups,
  restrictUser,
};
