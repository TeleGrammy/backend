const groupService = require("../../services/groupService");
const AppError = require("../../errors/appError");
const catchAsync = require("../../utils/catchAsync");

const getListOfParticipants = (tempMembers) => {
  const members = [];
  tempMembers.forEach((member) => {
    const memberData = member.adminId || member.memberId;
    const data = {
      id: memberData._id,
      username: memberData.username,
      picture: memberData.picture,
      lastSeen: memberData.lastSeen,
      customTitle: member.customTitle,
    };
    members.push(data);
  });
  return members;
};

const addNewGroup = catchAsync(async (req, res, next) => {
  const {groupName} = req.body;
  const userId = req.user.id;
  const groupData = await groupService.createGroup(groupName, userId);
  res.status(201).json({group: groupData});
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

const removeAdmin = catchAsync(async (req, res, next) => {
  const adminId = req.params.userId;
  const {groupId} = req.params;
  const participantId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const participantData = group.admins.find((participant) =>
    participant.adminId.equals(participantId)
  );
  if (!participantData)
    throw new AppError(
      "Unauthorized Action. The user does not have permission to remove an admin from admin list.",
      403
    );
  const index = group.admins.findIndex((admin) =>
    admin.adminId.equals(adminId)
  );

  if (index === -1)
    throw new AppError("User not found in administrator list", 404);

  if (
    group.admins[index].superAdminId.toString() !== participantId &&
    participantId !== group.ownerId.toString()
  )
    throw new AppError("Insufficient Permission.", 403);

  const member = groupService.createMember(
    group.admins[index].adminId.toString()
  );
  group.admins.splice(index, 1);
  group.members.push(member);

  await group.save();
  res.status(200).json({
    status: "success",
    data: {
      group,
    },
    message:
      "The user removed successfully from administrator list and added to members list.",
  });
});

const findGroup = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const group = await groupService.findGroupById(groupId);
  res.status(200).json(group);
});

const updateGroupLimit = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {groupSize} = req.body;
  const participantId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (group.ownerId.toString() !== participantId)
    throw new AppError(
      "Insufficient Permission. This feature is restricted to the owner of the group",
      403
    );

  if (group.admins.length + group.members.length > groupSize)
    throw new AppError(
      "The new size of the group is not allowed. The group contains participant greater than the new size",
      400
    );

  group.groupSizeLimit = groupSize;
  await group.save();

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The group size is updated successfully",
  });
});

const updateGroupType = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {groupType} = req.body;
  const participantId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (participantId !== group.ownerId.toString())
    throw new AppError(
      "Forbidden Action. The user is not the owner of the group",
      403
    );

  group.groupType = groupType;
  await group.save();

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The group type is updated successfully",
  });
});

const membersList = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const participantId = req.user.id;

  const group =
    await groupService.findGroupByIdWithPopulatedMembersAndAdmins(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const participantData =
    group.admins.find((admin) => admin.adminId.equals(participantId)) ||
    group.members.find((member) => member.memberId.equals(participantId));

  if (!participantData)
    throw new AppError(
      "Forbidden Action. You are not member of that group",
      403
    );

  const members = getListOfParticipants([...group.members, ...group.admins]);

  res.status(200).json({
    status: "success",
    data: {
      count: members.length,
      members,
    },
    message: "The list of members is retrieved successfully.",
  });
});

const adminsList = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const participantId = req.user.id;

  const group =
    await groupService.findGroupByIdWithPopulatedMembersAndAdmins(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const participantData =
    group.admins.find((admin) => admin.adminId.equals(participantId)) ||
    group.members.find((member) => member.memberId.equals(participantId));

  if (!participantData)
    throw new AppError(
      "Forbidden Action. You are not member of that group",
      403
    );

  const admins = getListOfParticipants(group.admins);

  res.status(200).json({
    status: "success",
    data: {
      count: admins.length,
      admins,
    },
    message: "The list of admins is retrieved successfully.",
  });
});

const muteNotification = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {mute} = req.body;
  const {muteUntil} = req.body;
  const participantId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const participantData =
    group.members.find(
      (member) => member.memberId.toString() === participantId
    ) ||
    group.admins.find((admin) => admin.adminId.toString() === participantId);

  if (!participantData) throw new AppError("User not found in the group", 404);

  participantData.mute = mute;

  participantData.muteUntil = muteUntil;

  await group.save();

  res.status(200).json({
    status: "success",
    data: {user: participantData},
    message: "The user is updated successfully.",
  });
});

const updateMemberPermission = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {memberId} = req.params;
  const participantId = req.user.id;
  const {body} = req;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  let index = group.admins.findIndex(
    (admin) => admin.adminId.toString() === participantId
  );

  if (index === -1)
    throw new AppError(
      "Forbidden Access. you does not have admin permission to update member permission.",
      403
    );

  index = group.members.findIndex(
    (member) => member.memberId.toString() === memberId
  );

  if (index === -1) throw new AppError("User not found in the group", 404);

  const currentPermission = group.members[index].permissions;

  const newPermission = {};

  Object.keys(currentPermission).forEach((key) => {
    if (typeof currentPermission[key] === "object") {
      newPermission[key] = {};
      Object.keys(currentPermission[key]).forEach((nestedKey) => {
        if (body[key] && body[key][nestedKey] !== undefined)
          newPermission[key][nestedKey] = body[key][nestedKey];
        else newPermission[key][nestedKey] = currentPermission[key][nestedKey];
      });
    } else if (body[key] !== undefined) newPermission[key] = body[key];
    else newPermission[key] = currentPermission[key];
  });

  group.members[index].permissions = newPermission;
  await group.save();

  res.status(200).json({
    status: "success",
    data: {
      user: group.members[index],
    },
    message: "The user's permissions is updated successfully",
  });
});

module.exports = {
  addNewGroup,
  findGroup,
  addAdmin,
  removeAdmin,
  updateGroupLimit,
  updateGroupType,
  membersList,
  adminsList,
  muteNotification,
  updateMemberPermission,
};
