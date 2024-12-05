const User = require("../models/user");

module.exports.getBasicProfileInfo = async (id) => {
  const profile = await User.findById(id).select(
    "email picture screenName username -_id"
  );
  return profile;
};
