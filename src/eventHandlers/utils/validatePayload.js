module.exports.validateRequiredFields = (payload, ...requiredFields) => {
  requiredFields.forEach((field) => {
    if (payload[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
};
