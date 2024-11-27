const userService = require("../../services/userService");

const Email = require("../../utils/mailingServcies");
const {generateConfirmationCode} = require("../../utils/codeGenerator");
const {filterObject} = require("../../utils/utilitiesFunc");
const AppError = require("../../errors/appError");
const catchAsync = require("../../utils/catchAsync");

exports.updateUserEmail = catchAsync(async (req, res, next) => {
  const {email} = req.body;

  const user = await userService.findOne({_id: req.user.id});

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
});

exports.requestNewConfirmationCode = catchAsync(async (req, res, next) => {
  const user = await userService.findOne({_id: req.user.id});

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
});

exports.confirmNewEmail = catchAsync(async (req, res, next) => {
  const {confirmationCode} = req.body;

  const user = await userService.getUserById(req.user.id);

  await user.verifyConfirmationCode(confirmationCode);

  await user.updateUserEmail();

  res.status(200).json({
    status: "success",
    data: {user},
  });
});

exports.getUserProfileInformation = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  res.status(200).json({
    status: "success",
    data: {user},
  });
});

exports.updateUserProfileInformation = catchAsync(async (req, res, next) => {
  const filteredBody = filterObject(
    req.body,
    "username",
    "phone",
    "bio",
    "screenName",
    "status"
  );

  const user = await userService.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {user},
  });
});

exports.deleteUserBio = catchAsync(async (req, res, next) => {
  const user = await userService.findByIdAndUpdate(
    req.user.id,
    {bio: ""},
    {new: true, runValidators: true}
  );

  res.status(200).json({
    status: "success",
    data: {user},
  });
});

exports.updateUserPicture = catchAsync(async (req, res, next) => {
  const photo = req.file;
  if (!photo) {
    next(new AppError("No photo uploaded", 400));
  }

  const user = await userService.getUserById(req.user.id);

  await user.updatePictureKey(photo.key);

  res.status(200).json({
    status: "success",
    data: {user},
  });
});

exports.deleteUserPicture = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id, "+pictureKey");

  await user.deleteUserPicture();

  user.pictureKey = undefined;
  res.status(200).json({
    status: "success",
    data: {user},
  });
});

exports.getUserActivity = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  const data = {
    status: user.status,
    lastSeen: user.lastSeen,
  };
  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateUserActivity = catchAsync(async (req, res, next) => {
  const user = await userService.findByIdAndUpdate(
    req.user.id,
    {
      status: req.body.status || "active",
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
});
