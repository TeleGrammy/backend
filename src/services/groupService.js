const {Group, GroupAdmin, GroupMember} = require("../models/groupModel");

const createGroup = (groupName, ownerId) => {
  const admin = new GroupAdmin({
    adminId: ownerId,
    customTitle: "Owner",
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

module.exports = {
  createGroup,
  findGroupById,
  deleteGroup,
};
