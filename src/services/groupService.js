const Group = require("../models/groupModel");

const createGroup = (groupName, ownerId, chatId) => {
  const admin = {
    adminId: ownerId,
    joinedAt: Date.now(),
    customTitle: "Owner",
    superAdminId: ownerId,
    permissions: {
      postStories: false,
      editStories: false,
      deleteStories: false,
      remainAnonymous: false,
    },
  };

  const newGroup = {
    name: groupName,
    ownerId,
    admins: [admin],
    chatId,
  };
  return Group.create(newGroup);
};

const deleteGroup = async (groupId) => Group.deleteOne({_id: groupId});

const findGroupById = (groupId) => {
  return Group.findById(groupId);
};

const findGroupByIdWithPopulatedMembersAndAdmins = (groupId) => {
  return Group.findById(groupId)
    .populate({
      path: "admins.adminId",
    })
    .populate({
      path: "members.memberId",
    });
};

const findAndUpdateGroup = (groupId, newData, options) => {
  const group = Group.findByIdAndUpdate(groupId, newData, options);
  return group;
};

const updateParticipant = (
  groupId,
  arrayField,
  userField,
  userFilter,
  newData,
  options
) => {
  const user = Group.findByIdAndUpdate(
    {
      _id: groupId,
      [`${userField}`]: userFilter,
    },
    {
      $set: {
        [`${arrayField}`]: newData,
      },
    },
    options
  );
  return user;
};

module.exports = {
  createGroup,
  findGroupById,
  deleteGroup,
  findAndUpdateGroup,
  findGroupByIdWithPopulatedMembersAndAdmins,
  updateParticipant,
};
