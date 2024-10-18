const User = require("../models/user");

class userServices {
  static getUserByEmail(email) {
    return User.findOne({email});
  }

  static findAll(filter) {
    return User.find(filter);
  }

  static findOne(filter) {
    return User.findOne(filter);
  }
}

module.exports = userServices;
