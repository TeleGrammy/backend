const {Group, GroupAdmin, GroupMember} = require("../models/groupModel");

const createGroup = (groupName, ownerId) => {
  const admin = new GroupAdmin({
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
  });

  const newGroup = {
    name: groupName,
    ownerId,
    admins: [admin],
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

const createAdmin = (memberData, newPermission, superAdminId, customTitle) => {
  const admin = new GroupAdmin({
    adminId: memberData.memberId,
    joinedAt: memberData.joinedAt,
    leftAt: memberData.leftAt,
    superAdminId,
    mute: memberData.mute,
    muteUntil: memberData.muteUntil,
    customTitle: customTitle ?? "Admin",
    permissions: newPermission,
  });
  return admin;
};

const createMember = (memberId) => {
  const member = new GroupMember({memberId});
  return member;
};

const findAndUpdateGroup = (groupId, newData, options) => {
  const group = Group.findByIdAndUpdate(groupId, newData, options);
  return group;
};

module.exports = {
  createGroup,
  findGroupById,
  deleteGroup,
  createAdmin,
  createMember,
  findAndUpdateGroup,
  findGroupByIdWithPopulatedMembersAndAdmins,
};
