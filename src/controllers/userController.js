const User = require("./../models/userModel");
const Email = require("../utils/mailingServcies");
const {generateConfirmationCode} = require("../utils/codeGenerator");

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
exports.updateUserName = async (req, res) => {
  const {username} = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {username},
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
    // TODO: make a global error handlers
    if (err.codeName === "DuplicateKey") {
      err.statusCode = 400;
      err.message = "Username already used";
    }
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.updateUserPhone = async (req, res) => {
  const {phone} = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {phone},
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
    if (err.codeName === "DuplicateKey") {
      err.statusCode = 400;
      err.message = "Phone already used";
    }
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};
exports.updateUserBio = async (req, res) => {
  const {bio} = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {bio},
      {new: true, runValidators: true}
    );
    await user.save();
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
