const catchAsync = require("../utils/catchAsync");
const groupService = require("../services/groupService");
const AppError = require("../errors/appError");

const groupExists = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);
  req.group = group;
  next();
});

const isRegularMember = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const {group} = req;

  if (group.userType !== undefined && req.userIndex !== undefined) next();

  const index = group.members.findIndex(
    (member) => member.memberId.toString() === userId
  );
  if (index !== -1) {
    req.userIndex = index;
    req.userType = "member";
  }

  return next();
});

const isAdmin = catchAsync(async (req, res, next) => {
  const {group} = req;
  const userId = req.user.id;

  if (group.userType !== undefined && req.userIndex !== undefined) next();

  const index = group.admins.findIndex(
    (admin) => admin.adminId.toString() === userId
  );
  if (index !== -1) {
    req.userIndex = index;
    req.userType = "admin";
  }
  return next();
});

module.exports = {groupExists, isRegularMember, isAdmin};
