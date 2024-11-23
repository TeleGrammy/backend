exports.filterObject = (object, ...allowedFields) => {
  const filtered = {};
  allowedFields.forEach((field) => {
    if (field in object) {
      filtered[field] = object[field];
    }
  });
  return filtered;
};

exports.extractProfileInfo = (user) => {
  return this.filterObject(
    user,
    "screenName",
    "username",
    "bio",
    "email",
    "phone",
    "picture",
    "status"
  );
};
