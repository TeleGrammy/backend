const User = require("./../models/user");
const Email = require("../utils/mailingServcies");
const {generateConfirmationCode} = require("../utils/codeGenerator");
const {filterObject} = require("../utils/utilitiesFunc");
const {AppError, handleError} = require("../errors/appError");
// require("dotenv").config({
//   path: ".env"
// });

exports.updateUserEmail = async (req, res) => {
  const {email} = req.body;
  try {
    const user = await User.findOne({_id: req.params.id});

    // Update pendingEmail and create confirmation code
    const confirmationCode = generateConfirmationCode();
    await user.setNewEmailInfo(email, confirmationCode);
    await Email.sendConfirmationEmail(
      email,
      user.username,
      confirmationCode,
      process.env.SNDGRID_TEMPLATEID_UPDATING_EMAIL
    );

    res.status(202).json({
      status: "pending",
      message: "please confirm your new email",
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.requestNewConfirmationCode = async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.id});

    // Update pendingEmail and create confirmation code
    const confirmationCode = generateConfirmationCode();
    await user.setNewEmailInfo(user.pendingEmail, confirmationCode);

    await Email.sendConfirmationEmail(
      user.pendingEmail,
      user.username,
      confirmationCode,
      process.env.SNDGRID_TEMPLATEID_UPDATING_EMAIL
    );

    res.status(202).json({
      status: "pending",
      message: "please confirm your new email",
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.confirmNewEmail = async (req, res, next) => {
  const {confirmationCode} = req.body;
  try {
    const user = await User.findById(req.params.id);

    await user.verifyConfirmationCode(confirmationCode);

    await user.updateUserEmail();

    res.status(200).json({
      status: "success",
      data: {user},
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.getUserProfileInformation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {user},
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
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {user},
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

    res.status(200).json({
      status: "success",
      data: {user},
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.updateUserPicture = async (req, res) => {
  const photo = req.file;
  if (!photo) {
    throw new AppError("No photo uploaded", 400);
  }
  try {
    const user = await User.findById(req.params.id);

    await user.updatePictureKey(photo.key);

    res.status(200).json({
      status: "success",
      data: {user},
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.deleteUserPicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+pictureKey");

    await user.deleteUserPicture();

    user.pictureKey = undefined;
    res.status(200).json({
      status: "success",
      data: {user},
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const data = {
      status: user.status,
      lastSeen: user.lastSeen,
    };
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.updateUserActivity = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status || "online",
        lastSeen: new Date(),
      },
      {new: true, runValidators: true}
    );

    const data = {
      status: user.status,
      lastSeen: user.lastSeen,
    };
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    handleError(err, req, res);
  }
};
