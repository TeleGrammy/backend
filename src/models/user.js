const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const applySoftDeleteMiddleWare = require("../middlewares/applySoftDelete");
const {phoneRegex} = require("../utils/regexFormat");
const AppError = require("../errors/appError");
const {generateSignedUrl, deleteFile} = require("../middlewares/AWS");

const contactSchema = new mongoose.Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  blockDetails: {
    status: {
      type: String,
      enum: ["blocked", "not_blocked"],
      default: "not_blocked",
    },
    date: {
      type: Date,
      default: null,
    },
  },
});

const userSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    unique: true,
    required: false,
    validate: {
      validator: (value) => {
        try {
          crypto.createPublicKey(value);
          return true;
        } catch (err) {
          return false;
        }
      },
      message: "Public key must be a valid PEM-formatted string.",
    },
  },
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
    // required: [true, "Password Confirm is required"],
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

  deletedDate: {
    type: Date,
    default: null,
  },
  screenName: {
    type: String,
    default: "User",
  },
  pictureKey: {
    type: String, // contain media key of the profile picture
    select: false,
  },
  picture: {
    type: String, // contain media url of the picture
    default: null,
  },
  bio: {type: String},

  lastLoginDate: {type: Date},

  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "inactive",
  },
  lastSeen: {
    type: Date,
    default: Date.now(),
  },
  contacts: [contactSchema],
  userChats: {
    type: Map,
    of: String,
    default: new Map(),
  },
  userDrafts: {
    type: Map,
    of: String,
    default: new Map(),
  },
  pendingEmail: {
    type: String,
    validate: [validator.isEmail, "Please provide a valid new email address"],
    default: undefined,
  },
  pendingEmailCofirmationCode: {
    type: String,
    default: undefined,
  },
  pendingEmailCofirmationCodeExpiresAt: {
    type: Date,
    default: undefined,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  gitHubId: {
    type: String,
    unique: true,
    sparse: true,
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
  passwordModifiedAt: {
    type: Date,
    default: null,
  },
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  lastPasswordResetRequestAt: Date,
  loggedOutFromAllDevicesAt: {type: Date, default: null},
  profilePictureVisibility: {
    type: String,
    enum: ["EveryOne", "Contacts", "Nobody"],
    default: "EveryOne",
  },

  storiesVisibility: {
    type: String,
    enum: ["EveryOne", "Contacts", "Nobody"],
    default: "EveryOne",
  },

  lastSeenVisibility: {
    type: String,
    enum: ["EveryOne", "Contacts", "Nobody"],
    default: "EveryOne",
  },

  readReceipts: {
    type: Boolean,
    default: true,
  },
});

userSchema.post(/^find/, async function (doc, next) {
  if (!doc || (Array.isArray(doc) && doc.length === 0)) {
    return next();
  }

  if (!doc.length) {
    await doc.generateSignedUrl();
  } else {
    await Promise.all(
      doc.map(async (document) => {
        await document.generateSignedUrl();
      })
    );
  }
  next();
});

userSchema.pre(/Delete$/, async function (next) {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
  }

  next();
});

userSchema.post(/^find/, async function (doc, next) {
  if (!doc || (Array.isArray(doc) && doc.length === 0)) {
    throw new AppError("User not found", 404);
  }

  if (!doc.length) {
    await doc.generateSignedUrl();
  } else {
    await Promise.all(
      doc.map(async (document) => {
        await document.generateSignedUrl();
      })
    );
  }
  next();
});

userSchema.pre(/Delete$/, async function (next) {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
  }

  next();
});

userSchema.post(/^find/, async function (doc, next) {
  if (!doc || (Array.isArray(doc) && doc.length === 0)) {
    return next();
  }

  if (!doc.length) {
    await doc.generateSignedUrl();
  } else {
    await Promise.all(
      doc.map(async (document) => {
        await document.generateSignedUrl();
      })
    );
  }
  next();
});

userSchema.pre(/Delete$/, async function (next) {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
  }

  next();
});

userSchema.post(/^find/, async function (doc, next) {
  if (!doc || (Array.isArray(doc) && doc.length === 0)) {
    return next();
  }

  if (!doc.length) {
    await doc.generateSignedUrl();
  } else {
    await Promise.all(
      doc.map(async (document) => {
        await document.generateSignedUrl();
      })
    );
  }
  next();
});

userSchema.pre(/Delete$/, async function (next) {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
  }

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

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

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const saltRounds = 12;
    update.password = await bcrypt.hash(update.password, saltRounds);
    update.passwordConfirm = await bcrypt.hash(
      update.passwordConfirm,
      saltRounds
    );
    update.passwordModifiedAt = Date.now();
  }
  next();
});

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(6).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiresAt =
    Date.now() + process.env.RESET_PASSWORD_TOKEN_DURATION * 60 * 1000;
  return resetToken;
};

userSchema.methods.setNewEmailInfo = async function (
  newEmail,
  confirmationCode
) {
  if (!newEmail) {
    throw new AppError(
      "Please make sure that you have provided a valid new email",
      404
    );
  }
  this.pendingEmail = newEmail;
  this.pendingEmailCofirmationCode = confirmationCode;
  this.pendingEmailCofirmationCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  await this.save();
};
userSchema.methods.unSetNewEmailInfo = async function () {
  this.pendingEmail = undefined;
  this.pendingEmailCofirmationCode = undefined;
  this.pendingEmailCofirmationCodeExpiresAt = undefined;
  await this.save();
};

userSchema.methods.updateUserEmail = async function () {
  if (!this.pendingEmail) {
    throw new AppError(
      "Please make sure that you have provided a valid new email",
      404
    );
  }
  this.email = this.pendingEmail;
  await this.unSetNewEmailInfo();
};

userSchema.methods.verifyConfirmationCode = function (confirmationCode) {
  if (!this.pendingEmail) {
    throw new AppError(
      "Please make sure that you have provided a valid new email",
      404
    );
  }
  if (this.pendingEmailCofirmationCodeExpiresAt < Date.now()) {
    this.unSetNewEmailInfo();
    throw new AppError(
      "Confirmation code expired please try to change your mail later",
      401
    );
  }
  if (this.pendingEmailCofirmationCode !== confirmationCode) {
    throw new AppError("Invalid confirmation code", 401);
  }
};

userSchema.methods.generateSignedUrl = async function () {
  if (this.pictureKey) {
    this.picture = await generateSignedUrl(this.pictureKey, 15 * 60);
  }
};

userSchema.methods.updatePictureKey = async function (key) {
  this.pictureKey = key;
  await this.generateSignedUrl();
  await this.save();
  this.pictureKey = undefined;
};
userSchema.methods.deleteUserPicture = async function () {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
    this.picture = "default.jpg";
    this.pictureKey = null;
    await this.save();
  }
};

applySoftDeleteMiddleWare(userSchema);

const User = mongoose.model("User", userSchema);

module.exports = User;
