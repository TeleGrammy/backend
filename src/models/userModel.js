const mongoose = require("mongoose");
const validator = require("validator");
const {AppError} = require("../errors/appError");
const {generateSignedUrl, deleteFile} = require("../middlewares/AWS");

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
  pictureKey: {
    type: String, // contain media key of the profile picture
    select: false
  },
  picture: {
    type: String, // contain media url of the picture
    default: null
  },
  bio: {type: String},
  lastLoginDate: {type: Date},
  status: {
    type: String,
    enum: ["online", "offline", "inactive", "banned"],
    default: "inactive"
  },
  lastSeen: {
    type: Date,
    default: Date.now()
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
userSchema.methods.setNewEmailInfo = async function(
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
userSchema.methods.unSetNewEmailInfo = async function() {
  this.pendingEmail = undefined;
  this.pendingEmailCofirmationCode = undefined;
  this.pendingEmailCofirmationCodeExpiresAt = undefined;
  await this.save();
};

userSchema.methods.updateUserEmail = async function() {
  if (!this.pendingEmail)
    throw new AppError(
      "Please make sure that you have provided a valid new email",
      404
    );
  this.email = this.pendingEmail;
  await this.unSetNewEmailInfo();
};

userSchema.methods.verifyConfirmationCode = function(confirmationCode) {
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

userSchema.methods.generateSignedUrl = async function() {
  if (this.pictureKey) {
    this.picture = await generateSignedUrl(this.pictureKey, 15 * 60);
  }
};

userSchema.methods.updatePictureKey = async function(key) {
  this.pictureKey = key;
  await this.generateSignedUrl();
  await this.save();
  this.pictureKey = undefined;
};
userSchema.methods.deleteUserPicture = async function() {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
    this.picture = "default.jpg";
    this.pictureKey = null;
    await this.save();
  }
};
userSchema.post(/^find/, async function(doc, next) {
  if (!doc) {
    throw new AppError("User not found", 404);
  }

  if (!doc.length) {
    await doc.generateSignedUrl();
  } else {
    await Promise.all(
      doc.map(async document => {
        await document.generateSignedUrl();
      })
    );
  }
  next();
});

userSchema.pre(/Delete$/, async function(next) {
  if (this.pictureKey) {
    await deleteFile(this.pictureKey);
  }

  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
