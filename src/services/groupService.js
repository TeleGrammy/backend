const Group = require("../models/groupModel");

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
  return Group.findById(groupId);
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

const findGroup = (filter, populateOptions) => {
  let query = Group.findOne(filter);
  if (populateOptions) {
    query = query.populate(populateOptions);
  }
  return query;
};

const searchGroup = (filter, select, populatedOptions) => {
  const pipeline = [];
  pipeline.push({$match: filter});

  if (select) pipeline.push({$project: select});
  if (populatedOptions) pipeline.push({$lookup: populatedOptions});

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
