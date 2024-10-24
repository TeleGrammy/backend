const mongoose = require("mongoose");
const validator = require("validator");

const {phoneRegex} = require("../utils/regexFormat");

const pendignUserSchema = new mongoose.Schema({
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
    validator: {
      validator(element) {
        return phoneRegex.test(element);
      },
      message: "Invalid phone number format.",
    },
    unique: [
      true,
      "This phone number is already registered. Please use a different number.",
    ],
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  isValid: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  codeExpiresAt: {
    type: Date,
    required: true,
    default: new Date(Date.now() + 10 * 60 * 1000),
  },
});

const PendingUser = mongoose.model("PendingUsers", pendignUserSchema);

module.exports = PendingUser;
