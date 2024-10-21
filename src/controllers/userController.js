const User = require("./../models/userModel");
const Email = require("../utils/mailingServcies");
const {generateConfirmationCode} = require("../utils/codeGenerator");
const {filterObject} = require("../utils/utilitiesFunc");
const {generateSignedUrl, deleteFile} = require("../middlewares/AWS");
const {AppError, handleError} = require("../errors/appError");

exports.updateUserEmail = async (req, res) => {
  const {email} = req.body;
  try {
    const user = await User.findOne({_id: req.params.id});
    if (!user) {
      throw new AppError("User not found", 404);
    }
    // Update pendingEmail and create confirmation code
    const confirmationCode = generateConfirmationCode();
    await user.setNewEmailInfo(email, confirmationCode);

    await Email.sendConfirmationEmail(email, user.username, confirmationCode);

    res.status(202).json({
      status: "pending",
      message: "please confirm your new email"
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.requestNewConfirmationCode = async (req, res) => {
  const {email} = req.body;
  try {
    const user = await User.findOne({_id: req.params.id});
    if (!user) {
      throw new AppError("User not found", 404);
    }
    // Update pendingEmail and create confirmation code
    const confirmationCode = generateConfirmationCode();
    await user.setNewEmailInfo(user.pendingEmail, confirmationCode);

    await Email.sendConfirmationEmail(email, user.username, confirmationCode);

    res.status(202).json({
      status: "pending",
      message: "please confirm your new email"
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.confirmNewEmail = async (req, res, next) => {
  const {confirmationCode} = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await user.verifyConfirmationCode(confirmationCode);

    user.updateUserEmail();

    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.getUserProfileInformation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const signedUrl = await generateSignedUrl(user.picture, 15 * 60); // URL valid for 15 minutes

    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.updateUserProfileInformation = async (req, res) => {
  const filteredBody = filterObject(
    req.body,
    "username",
    "phone",
    "bio",
    "screenName",
    "status"
  );

  try {
    const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    handleError(err, req, res);
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

exports.updateUserPicture = async (req, res) => {
  const photo = req.file;
  if (!photo) {
    throw new AppError("No photo uploaded", 400);
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {pictureKey: photo.key},
      {new: true, runValidators: true}
    );
    if (!user) {
      throw new AppError("User not found", 404);
    }
    user.pictureKey = undefined;
    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.deleteUserPicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    await user.deleteUserPicture();

    user.pictureKey = undefined;
    res.status(200).json({
      status: "success",
      data: {user}
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    const data = {
      status: user.status,
      lastSeen: user.lastSeen
    };
    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.updateUserActivity = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        lastSeen: new Date()
      },
      {new: true, runValidators: true}
    );
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    const data = {
      status: user.status,
      lastSeen: user.lastSeen
    };
    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};
