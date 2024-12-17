const mongoose = require("mongoose");

const AppError = require("../errors/appError");

const User = require("../models/user");

const getUsers = async (adminId) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new AppError("Invalid adminId provided", 400);
  }

  return User.find({_id: {$ne: adminId}}).select(
    "username screenName phone email bio status pictureKey picture"
  );
};

const restrictUser = async (userId, newData, options) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new AppError("Invalid adminId provided", 400);
  }

  return User.findByIdAndUpdate(userId, newData, options).select(
    "username screenName phone email bio status pictureKey picture"
  );
};

module.exports = {
  getUsers,
  restrictUser,
};
