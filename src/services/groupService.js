const AppError = require("../errors/appError");

const Group = require("../models/group");

const changeGroupsPolicy = async (groupIds, newPolicy) => {
  return await Group.updateMany(
    {_id: {$in: groupIds}},
    {$set: {addingMembersPolicy: newPolicy}}
  );
};

module.exports = {
  changeGroupsPolicy,
};
