const groupService = require("../../services/groupService");
const chatService = require("../../services/chatService");
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

/**
 * Merge current Permission with the new ones
 * @param {Object} currentPermission - The current permission of group's participant
 * @param {Object} body - The new permission received from the user
 * @returns {Object} - The new Permission of participant
 */
const mergePermission = (currentPermission, body) => {
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

  return newPermission;
};
/**
 * create new Admin object
 * @param {Object} memberData - The current member data stored in the database
 * @param {Object} newPermission - New Admin Permission
 * @param {mongoose.Type.Object} superAdminId - ID of admin who promote him to be an admin
 * @param {String} customTitle - Custom Title which will appear for member of the group
 * @returns {Object} - The created admin object
 */
const createAdminObject = (
  memberData,
  newPermission,
  superAdminId,
  customTitle
) => {
  const newAdmin = {
    adminId: memberData.memberId,
    joinedAt: memberData.joinedAt,
    leftAt: memberData.leftAt,
    superAdminId,
    mute: memberData.mute,
    muteUntil: memberData.muteUntil,
    customTitle: customTitle ?? "Admin",
    permissions: newPermission,
  };
  return newAdmin;
};

const addNewGroup = catchAsync(async (req, res, next) => {
  const {groupName} = req.body;
  const {image} = req.body;
  const userId = req.user.id;

  const groupChat = await chatService.createChat({isGroup: true});

  await chatService.addParticipant(groupChat._id, {userId});

  const groupData = await groupService.createGroup(
    groupName,
    image,
    userId,
    groupChat._id
  );

  res.status(201).json({
    status: "success",
    data: {
      group: groupData,
    },
    message: "The group was created successfully.",
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

  const newAdmin = createAdminObject(
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
    data: {group, newAdmin},
    message: "The user has been successfully promoted to admin.",
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
      "Unauthorized action. You do not have permission to demote an admin.",
      403
    );
  const index = group.admins.findIndex((admin) =>
    admin.adminId.equals(adminId)
  );

  if (index === -1) throw new AppError("User not found in admin list", 404);

  if (
    group.admins[index].superAdminId.toString() !== participantId &&
    participantId !== group.ownerId.toString()
  )
    throw new AppError("Insufficient Permission.", 403);

  const member = {
    memberId: group.admins[index].adminId,
  };

  group.admins.splice(index, 1);
  group.members.push(member);

  await group.save();
  res.status(200).json({
    status: "success",
    data: {
      group,
    },
    message:
      "The user was successfully removed from the admin list and added back to members.",
  });
});

const findGroup = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The group was retrieved successfully.",
  });
});

const updateGroupLimit = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {groupSize} = req.body;
  const participantId = req.user.id;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (group.ownerId.toString() !== participantId)
    throw new AppError(
      "Insufficient permissions. Only the group owner can update the group size.",
      403
    );

  if (group.admins.length + group.members.length > groupSize)
    throw new AppError(
      "The new size of the group is not allowed. The group contains more members than the specified size.",
      400
    );

  group.groupSizeLimit = groupSize;
  await group.save();

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The group size has been updated successfully.",
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
      "Insufficient permissions. Only the group owner can update the group type.",
      403
    );

  group.groupType = groupType;
  await group.save();

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The group type has been updated successfully",
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
    message: "The list of members has been retrieved successfully.",
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
    message: "The list of admins has been retrieved successfully.",
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
    message: "The member has updated his mute notification successfully.",
  });
});

const updateMemberPermission = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {memberId} = req.params;
  const participantId = req.user.id;
  const {body} = req;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const adminData = group.admins.find(
    (admin) => admin.adminId.toString() === participantId
  );

  if (!adminData)
    throw new AppError(
      "Forbidden access. You do not have admin permissions to update member permissions.",
      403
    );

  const memberData = group.members.find(
    (member) => member.memberId.toString() === memberId
  );

  if (!memberData) throw new AppError("User not found in the group", 404);

  memberData.permissions = mergePermission(memberData.permissions, body);

  await group.save();

  res.status(200).json({
    status: "success",
    data: {
      member: memberData,
    },
    message: "The user's permissions have been updated successfully.",
  });
});

const updateAdminPermission = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const {adminId} = req.params;
  const participantId = req.user.id;
  const {body} = req;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  const adminData = group.admins.find(
    (admin) => admin.adminId.toString() === adminId
  );

  if (!adminData)
    throw new AppError(
      "Admin not found. The provided id is not an admin ID.",
      404
    );

  if (
    participantId !== group.ownerId.toString() &&
    participantId !== adminData.superAdminId.toString()
  )
    throw new AppError(
      "Forbidden access. You don't have the permission to change the admin's permissions.",
      403
    );

  adminData.permissions = mergePermission(adminData.permissions, body);

  await group.save();

  res.status(200).json({
    status: "success",
    data: {
      admin: adminData,
    },
    message: "The admin's permissions have been updated successfully.",
  });
});

const updateGroupBasicInfo = catchAsync(async (req, res, next) => {
  const {groupId} = req.params;
  const participantId = req.user.id;
  let {name} = req.body;
  let {description} = req.body;
  let {image} = req.body;

  const group = await groupService.findGroupById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  let participantData = group.admins.find(
    (admin) => admin.adminId.toString() === participantId
  );
  if (
    group.groupPermissions.changeChatInfo === false &&
    (!participantData || participantData.permissions.changeGroupInfo === false)
  )
    throw new AppError(
      "Forbidden access. You do not have permission to change the group's information.",
      403
    );

  if (group.groupPermissions.changeChatInfo === true && !participantData) {
    participantData = group.members.find(
      (member) => member.memberId.toString() === participantId
    );
    if (!participantData)
      throw new AppError("User not found in the group", 404);
    if (participantData.permissions.changeChatInfo === false)
      throw new AppError(
        "Forbidden access. You do not have permission to change the group's information.",
        403
      );
  }
  if (name === undefined) name = group.name;
  if (description === undefined) description = group.description;
  if (image === undefined) image = group.image;

  group.name = name;
  group.description = description;
  group.image = image;
  await group.save();

  res.status(200).json({
    status: "success",
    data: {group},
    message: "The group information has been updated successfully.",
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
  updateAdminPermission,
  updateGroupBasicInfo,
};
