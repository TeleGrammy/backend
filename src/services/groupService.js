const Group = require("../models/groupModel");
const mongoose = require("mongoose");

const createGroup = (name, image, ownerId) => {
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
    name,
    image,
    ownerId,
    admins: [admin],
  };
  return Group.create(newGroup);
};

const deleteGroup = async (filter) => Group.deleteOne(filter);

const findGroupById = (groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new AppError("Invalid groupdId provided", 400);
  }

  return Group.findById(groupId);
};

const findAndUpdateGroup = (groupId, newData, options) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new AppError("Invalid groupdId provided", 400);
  }

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
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new AppError("Invalid groupdId provided", 400);
  }

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
  updateParticipant,
};
