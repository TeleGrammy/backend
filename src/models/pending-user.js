const mongoose = require("mongoose");
const validator = require("validator");

const {phoneRegex} = require("../utils/regexFormat");

const pendingUserSchema = new mongoose.Schema({
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
    default: new Date(Date.now() + 60 * 60 * 1000),
  },
  publicKey: {
    type: String,
    validate: {
      validator: (value) => {
        try {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          crypto.createPublicKey(value);
          return true;
        } catch (err) {
          return false;
        }
      },
      message: "Public key must be a valid PEM-formatted string.",
    },
  },
  expiresAt: {type: Date}, // Exact expiration time for TTL
});

pendingUserSchema.pre("save", function (next) {
  this.codeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return next();
});
pendingUserSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const PendingUser = mongoose.model("PendingUsers", pendingUserSchema);

module.exports = PendingUser;
