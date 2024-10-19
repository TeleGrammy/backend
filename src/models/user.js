const mongoose = require("mongoose");
const validator = require("validator");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required. Please enter a username."],
    unique: [
      true,
      "This username already exists. Please choose a different one.",
    ],
  },

  email: {
    type: String,
    required: [
      true,
      "Email address is required. Please enter your email address.",
    ],
    unique: [
      true,
      "This email address is already taken. Please use a different email.",
    ],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address."],
  },

  password: {
    type: String,
    required: [true, "Password is required. Please enter a password."],
    minlength: [8, "Password must be at least 8 characters long"],
  },

  phone: {
    type: String,
    default: null,
  },

  registrationDate: {
    type: Date,
    default: Date.now,
  },

  deletedDate: {
    type: Date,
    default: null,
  },

  picture: {type: String},

  bio: {type: String},

  lastLoginDate: {type: Date},

  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "inactive",
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  faceBookId: {
    type: String,
    unique: true,
    sparse: true,
  },

  gitHubId: {
    type: String,
    unique: true,
    sparse: true,
  },

  jwtRefreshToken: {
    type: String,
    default: null,
  },

  accessToken: {
    type: String,
    default: null,
  },

  refreshToken: {
    type: String,
    default: null,
  },

  accessTokenExpiresAt: {
    type: Date,
    default: null,
  },

  refreshTokenExpiresAt: {
    type: Date,
    default: null,
  },
});

applySoftDeleteMiddleWare(userSchema);
const User = mongoose.model("User", userSchema);

module.exports = User;
