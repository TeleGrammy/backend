const PendingUser = require("../../models/pending-user");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");

const {generateConfirmationCode} = require("../../utils/codeGenerator");

const {sendConfirmationEmail} = require("../../utils/mailingServcies");

exports.postRegistration = catchAsync(async (req, res, next) => {
  const {username, email, password, passwordConfirm, phone} = req.body;

  const verificationCode = generateConfirmationCode();

  const newUser = new PendingUser({
    username,
    email,
    password,
    passwordConfirm,
    phone,
    verificationCode,
  });
  await sendConfirmationEmail(email, username, verificationCode);

  await newUser.save();

  return res.status(201).json({
    message:
      "Registration successful. Please check your email for the verification code.",
  });
});

exports.postVerfiy = async (req, res) => {
  const {email, verificationCode} = req.body;

  if (!email) {
    return res.status(400).json({message: "Email is required"});
  }
  if (!verificationCode) {
    return res.status(400).json({message: "Verification code is required"});
  }

  const pendingUser = await PendingUser.findOne({email});

  if (!pendingUser) {
    return res.status(404).json({message: "User not found"});
  }

  if (pendingUser.verificationCode !== verificationCode) {
    return res.status(400).json({message: "Invalid verification code"});
  }

  if (pendingUser.codeExpiresAt < new Date()) {
    return res.status(400).json({message: "Verification code has expired"});
  }

  await userService.createUser({
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password,
    passwordConfirm: pendingUser.passwordConfirm,
    phone: pendingUser.phone,
  });
  await PendingUser.deleteOne({email});

  return res.status(200).json({message: "Account verified successfully"});
};

exports.resendVerification = async (req, res) => {
  const {email} = req.body;
  if (!email) {
    return res.status(400).json({message: "Email is required"});
  }

  const pendingUser = await PendingUser.findOne({email});

  if (!pendingUser) {
    return res
      .status(404)
      .json({message: "User not found or already verified"});
  }

  const newVerificationCode = generateConfirmationCode();

  pendingUser.verificationCode = newVerificationCode;
  pendingUser.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await pendingUser.save();

  await sendConfirmationEmail(
    pendingUser.email,
    pendingUser.username,
    newVerificationCode
  );

  return res
    .status(200)
    .json({message: "Verification code resent successfully"});
};
