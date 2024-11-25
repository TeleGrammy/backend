const groupService = require("../../services/groupService");
const AppError = require("../../errors/appError");
const catchAsync = require("../../utils/catchAsync");

const addNewGroup = catchAsync(async (req, res, next) => {
  const {groupName} = req.body;
  const userId = req.user.id;
  const groupData = await groupService.createGroup(groupName, userId);
  res.status(201).json({group: groupData});
});

const leaveGroup = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const userId = req.user.id;

  const group = await groupService.findGroupById(groupId);

  if (!group) throw new AppError("Group not found.", 404);

  let index = group.members.filter((member) => member.memberId === userId);
  if (index === -1) {
    index = group.admins.filter((admin) => admin.adminId === userId);
    if (index === -1)
      throw new AppError(
        "The user is not a member of the group with that id.",
        400
      );
    else group.admins.splice(index, 1);
  } else {
    group.members.splice(index, 1);
  }

  const totalMembers = group.admins.length + group.members.length;
  if (totalMembers === 0) {
    await groupService.deleteGroup(groupId);
  } else {
    await group.save();
  }

  res.status(200).json({
    status: "success",
    data: {},
    message: "You left the group successfully",
  });
});

const deleteGroup = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const userId = req.user.id;
  const group = await groupService.findGroupById(groupId);

  if (!group) throw new AppError("Group not found.", 404);

  if (group.ownerId.equals(userId)) {
    await groupService.deleteGroup(groupId);
    return res.status(200).json({
      status: "success",
      data: {},
      message: "The group is deleted Successfully",
    });
  }
  return res.status(403).json({
    status: "success",
    data: {},
    message: "The user doesn't have the permission to delete the group",
  });
});

const findGroup = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const group = await groupService.findGroupById(groupId);
  res.status(200).json(group);
});

module.exports = {
  addNewGroup,
  findGroup,
  leaveGroup,
  deleteGroup,
};
