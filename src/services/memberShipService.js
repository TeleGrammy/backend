const AppError = require("../errors/appError");

const MemberShip = require("../models/memberShip");

const getAdminMemberShips = async (userId) => {
  return await MemberShip.find({userId, role: "Admin"});
};

module.exports = {
  getAdminMemberShips,
};
