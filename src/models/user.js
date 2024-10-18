const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

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
  passwordConfirm: {
    type: String,
    required: [true, "Password Confirm is required"],
    validate: {
      validator(el) {
        return el === this.password;
      },
      message: "Password and passwordConfirm are different.",
    },
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
  passwordModifiedAt: {
    type: Date,
    default: null,
  },
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  lastPasswordResetRequestAt: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordModifiedAt = Date.now();
  return next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(6).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiresAt = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
