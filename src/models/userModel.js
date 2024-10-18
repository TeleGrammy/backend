const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please enter a username"],
    unique: [true, "the user name already used"]
  },
  email: {
    type: String,
    required: [true, "please enter your email address"],
    unique: [true, "your email address is not correct"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "please enter a password"]
  },
  phone: {
    type: String,
    unique: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  screenName: {
    type: String,
    default: "User"
  },
  picture: {
    type: String,
    default: "default.jpg"
  },
  bio: {type: String},
  lastLoginDate: {type: Date},
  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "inactive"
  },
  pendingEmail: {
    type: String,
    validate: [validator.isEmail, "Please provide a valid new email address"],
    default: undefined
  },
  pendingEmailCofirmationCode: {
    type: String,
    default: undefined
  },
  pendingEmailCofirmationCodeExpiresAt: {
    type: Date,
    default: undefined
  }
});
userSchema.methods.setNewEmailInfo = function(newEmail, confirmationCode) {
  this.pendingEmail = newEmail;
  this.pendingEmailCofirmationCode = confirmationCode;
  this.pendingEmailCofirmationCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
};
userSchema.methods.unSetNewEmailInfo = function() {
  this.pendingEmail = undefined;
  this.pendingEmailCofirmationCode = undefined;
  this.pendingEmailCofirmationCodeExpiresAt = undefined;
};

userSchema.methods.updateUserEmail = function() {
  this.email = this.pendingEmail;
  this.unSetNewEmailInfo();
};

userSchema.methods.verifyConfirmationCode = function(confirmationCode) {
  if (this.pendingEmailCofirmationCodeExpiresAt < Date.now()) {
    this.unSetNewEmailInfo();
    const err = new Error(
      "Confirmation code expired please try to change your mail  later"
    );
    err.statusCode = 401;
    throw err;
  }
  if (this.pendingEmailCofirmationCode !== confirmationCode) {
    const err = new Error("Invalid confirmation code");
    err.statusCode = 401;
    throw err;
  }
};
const User = mongoose.model("User", userSchema);

module.exports = User;
