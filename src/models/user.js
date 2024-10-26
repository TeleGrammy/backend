const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");
const {phoneRegex} = require("../utils/regexFormat");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required. Please enter a username."],
    unique: [
      true,
      "This username already exists. Please choose a different one."
    ]
  },

  email: {
    type: String,
    required: [
      true,
      "Email address is required. Please enter your email address."
    ],
    unique: [
      true,
      "This email address is already taken. Please use a different email."
    ],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address."]
  },

  password: {
    type: String,
    required: [true, "Password is required. Please enter a password."],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  passwordConfirm: {
    type: String,
    required: [true, "Password Confirm is required"],
    validate: {
      validator(el) {
        return el === this.password;
      },
      message: "Password and passwordConfirm are different."
    }
  },

  phone: {
    type: String,
    validator: {
      validator(element) {
        return phoneRegex.test(element);
      },
      message: "Invalid phone number format."
    },
    unique: [
      true,
      "This phone number is already registered. Please use a different number."
    ]
  },

  registrationDate: {
    type: Date,
    default: Date.now
  },

  deletedDate: {
    type: Date,
    default: null
  },

  picture: {type: String},

  bio: {type: String},

  lastLoginDate: {type: Date},

  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "inactive"
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  faceBookId: {
    type: String,
    unique: true,
    sparse: true
  },

  gitHubId: {
    type: String,
    unique: true,
    sparse: true
  },

  jwtRefreshToken: {
    type: String,
    default: null
  },

  accessToken: {
    type: String,
    default: null
  },

  refreshToken: {
    type: String,
    default: null
  },

  accessTokenExpiresAt: {
    type: Date,
    default: null
  },

  refreshTokenExpiresAt: {
    type: Date,
    default: null
  },
  passwordModifiedAt: {
    type: Date,
    default: null
  },
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  lastPasswordResetRequestAt: Date,
  loggedOutFromAllDevicesAt: {type: Date, default: null}
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordModifiedAt = Date.now();
  return next();
});

userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre("findOneAndUpdate", async function(next) {
  const update = this.getUpdate();
  if (update.password) {
    const saltRounds = 12;
    update.password = await bcrypt.hash(update.password, saltRounds);
    update.passwordConfirm = undefined;
    update.passwordModifiedAt = Date.now();
  }
  next();
});

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(6).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiresAt = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

applySoftDeleteMiddleWare(userSchema);

const User = mongoose.model("User", userSchema);

module.exports = User;
