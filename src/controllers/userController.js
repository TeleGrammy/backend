const User = require("./../models/userModel");
const Email = require("../utils/mailingServcies");
const {generateConfirmationCode} = require("../utils/codeGenerator");
const {filterObject} = require("../utils/utilitiesFunc");

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

    user.verifyConfirmationCode(confirmationCode);

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

exports.updateUserPicture = async (req, res) => {
  const photo = req.file;
  if (!photo) {
    const err = new Error("No image uploaded.");
    err.statusCode = 400;
    throw err;
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {picture: photo.location},
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

exports.deleteUserPicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {picture: "default.jpg"},
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
