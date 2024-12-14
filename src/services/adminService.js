const mongoose = require("mongoose");

const AppError = require("../errors/appError");

const User = require("../models/user");

const getUsers = async (adminId) => {
  if (!adminId) {
    throw new AppError("Admin's Id should be passed", 500);
  }
  return await User.find({_id: {$ne: adminId}}).select(
    "username screenName phone email bio status picture"
  );
};

const restrictUser = async (userId, newData, options) => {
  if (!userId) {
    throw new AppError("User's Id should be passed", 500);
  }

  return await User.findByIdAndUpdate(userId, newData, options).select(
    "username screenName phone email bio status picture"
  );
};

module.exports = {
  getUsers,
  restrictUser,
};
