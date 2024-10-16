const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please enter a username"],
    unique: [true, "the user name already used"],
  },
  email: {
    type: String,
    required: [true, "please enter your email address"],
    unique: [true, "your email address is not correct"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "please enter a password"],
  },
  phone: {
    type: String,
    unique: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  picture: {type: String},
  bio: {type: String},
  lastLoginDate: {type: Date},
  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "inactive",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
