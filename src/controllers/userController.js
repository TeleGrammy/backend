const User = require("./../models/userModel");
const Email = require("../utils/mailingServcies");
const {generateConfirmationCode} = require("../utils/codeGenerator");
const {filterObject} = require("../utils/utilitiesFunc");
const multer = require("multer");

// Multer settings for file uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Invalid file format"), false);
    }
    cb(null, true);
  }
});
exports.updateUserEmail = async (req, res) => {
  const {email} = req.body;
  try {
    const user = await User.findOne({_id: req.params.id});
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    // Update pendingEmail and create confirmation code
    const confirmationCode = generateConfirmationCode();
    user.setNewEmailInfo(email, confirmationCode);
    await user.save();

    await Email.sendConfirmationEmail(email, user.username, confirmationCode);

    res.status(202).json({
      status: "pending",
      message: "please confirm your new email"
    });
  } catch (err) {
    console.log(err);

    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.requestNewConfirmationCode = async (req, res) => {
  const {email} = req.body;
  try {
    const user = await User.findOne({_id: req.params.id});
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    // Update pendingEmail and create confirmation code
    const confirmationCode = generateConfirmationCode();
    user.setNewEmailInfo(user.pendingEmail, confirmationCode);
    await user.save();

    await Email.sendConfirmationEmail(email, user.username, confirmationCode);

    res.status(202).json({
      status: "pending",
      message: "please confirm your new email"
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.confirmNewEmail = async (req, res, next) => {
  const {confirmationCode} = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    console.log("here");
    if (user.pendingEmailCofirmationCodeExpiresAt < Date.now()) {
      user.unSetNewEmailInfo();
      const err = new Error(
        "Confirmation code expired please try to change your mail  later"
      );
      err.statusCode = 401;
      throw err;
    }
    console.log("here2");

    if (user.pendingEmailCofirmationCode !== confirmationCode) {
      const err = new Error("Invalid confirmation code");
      err.statusCode = 401;
      throw err;
    }

    user.updateUserEmail();
    await user.save();

    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.updateUserInformation = async (req, res) => {
  const filteredBody = filterObject(
    req.body,
    "username",
    "phone",
    "bio",
    "screenName"
  );
  try {
    const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    console.log(err);
    if (err.codeName === "DuplicateKey") {
      err.statusCode = 400;
      if (err.keyPattern.username) err.message = "username already used.";
      if (err.keyPattern.phone) err.message = "phone already used.";
    }
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.deleteUserBio = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {bio: ""},
      {new: true, runValidators: true}
    );
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.uploadUserPhoto = upload.single("picture");

exports.updateUserPicture = async (req, res) => {};
