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
    type: String // contain media key of the profile picture
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
  if (!this.pendingEmail)
    throw new AppError(
      "Please make sure that you have provided a valid new email",
      404
    );
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
  this.email = this.pendingEmail;
  this.unSetNewEmailInfo();
  await this.save();
};

userSchema.methods.verifyConfirmationCode = function(confirmationCode) {
  if (!this.pendingEmailCofirmationCode) {
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
  try {
    if (this.pictureKey) {
      this.picture = await generateSignedUrl(this.pictureKey, 15 * 60);
    }
  } catch (err) {
    console.error(`Error generatingurl for picture :`, err);
  }
};

userSchema.methods.deleteUserPicture = async function() {
  try {
    if (this.pictureKey) {
      await deleteFile(this.pictureKey);
      this.picture = "default.jpg";
      this.pictureKey = null;
      await this.save();
    }
  } catch (err) {
    console.error(`Error deleting story ${this._id}:`, err);
  }
};
userSchema.post(/^find/, async function(doc, next) {
  if (!doc) next();

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
  try {
    if (this.pictureKey) {
      await deleteFile(this.pictureKey);
    }
  } catch (err) {
    console.error(`Error deleting story ${this._id}:`, err);
  }
  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
