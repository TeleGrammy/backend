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

  return Group.findByIdAndUpdate(groupId, newData, options);
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

const findGroup = (filter, populateOptions) => {
  let query = Group.findOne(filter);
  if (populateOptions) {
    query = query.populate(populateOptions);
  }
  return query;
};

const searchGroup = (filter, select, skip, limit, populatedOptions) => {
  const pipeline = [];
  pipeline.push({$match: filter});

  if (select) pipeline.push({$project: select});
  if (populatedOptions) pipeline.push({$lookup: populatedOptions});
  if (skip) pipeline.push({$skip: skip});
  if (limit) pipeline.push({$limit: limit});

  const query = Group.aggregate(pipeline);
  return query;
};

module.exports = {
  createGroup,
  findGroupById,
  deleteGroup,
  findAndUpdateGroup,
  updateParticipant,
  findGroup,
  searchGroup,
};
