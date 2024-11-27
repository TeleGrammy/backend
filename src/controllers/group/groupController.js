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

  let index = group.members.findIndex((member) =>
    member.memberId.equals(userId)
  );

  if (index === -1) {
    index = group.admins.findIndex((admin) => admin.adminId.equals(userId));
    if (index === -1)
      throw new AppError(
        "User not found. The user is not a member of the group with that id.",
        404
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

  if (!group.ownerId.equals(userId))
    throw new AppError(
      "The user doesn't have the permission to delete the group",
      403
    );

  await groupService.deleteGroup(groupId);
  return res.status(200).json({
    status: "success",
    data: {},
    message: "The group is deleted Successfully",
  });
});

const addAdmin = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {userId} = req.params;
  const superAdminId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const adminData = group.admins.find((admin) =>
    admin.adminId.equals(superAdminId)
  );

  if (!adminData)
    throw new AppError(
      "Unauthorized Access.The user does not have the permission to add new admin.",
      403
    );

  let index = group.members.findIndex((member) =>
    member.memberId.equals(userId)
  );

  if (index === -1) {
    index = group.admins.findIndex((admin) => admin.adminId.equals(userId));
    if (index === -1)
      throw new AppError(
        "User not found. The user is not member of the group.",
        404
      );
    else throw new AppError("The user is already an admin", 400);
  }

  const memberData = group.members[index];

  const adminPermission = adminData.permissions;
  const newPermission = {};

  Object.keys(adminPermission).forEach((property) => {
    if (adminPermission[property] === false) newPermission[property] = false;
    else if (req.body[property] !== undefined)
      newPermission[property] = req.body[property];
    else newPermission[property] = adminPermission[property];
  });

  const newAdmin = groupService.createAdmin(
    memberData,
    newPermission,
    superAdminId,
    req.body.customTitle
  );

  group.members.splice(index, 1);
  group.admins.push(newAdmin);
  await group.save();

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The user is promoted to admin successfully",
  });
});

const addMember = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {userId} = req.params;
  const participantId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  let participantData = group.members.find((member) =>
    member.memberId.equals(participantId)
  );

  const participantType = participantData ? "member" : "admin";
  participantData =
    participantData ??
    group.admins.find((admin) => admin.adminId.equals(participantId));

  if (!participantData)
    throw new AppError(
      "Unauthorized Access. The user who did the request is not a member of the group",
      401
    );

  const addUsersGroupPermission = group.groupPermission.addUsers;

  if (
    (!addUsersGroupPermission && participantType === "member") ||
    (!addUsersGroupPermission &&
      participantType === "admin" &&
      !participantData.permissions.addUsers)
  )
    throw new AppError(
      `Insufficient Permissions. The ${participantType} does not have permission to add new users.`,
      403
    );

  let index = group.members.findIndex((member) =>
    member.memberId.equals(userId)
  );

  if (index === -1) {
    index = group.admins.findIndex((admin) => admin.adminId.equals(userId));
    if (index !== -1) throw new AppError("The user is already an admin", 400);
  } else {
    throw new AppError("The user is already member of the group", 400);
  }

  const newMember = groupService.createMember(userId);

  index = group.leftMembers.findIndex((member) =>
    member.memberId.equals(userId)
  );

  newMember.leftAt = index === -1 ? null : group.leftMembers[index].leftAt;

  group.members.push(newMember);
  await group.save();

  res.status(201).json({
    status: "success",
    data: {group},
    message: "The user is added successfully to the group",
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
  addAdmin,
  addMember,
};
