const userService = require("../../services/userService");

const Email = require("../../utils/mailingServcies");
const catchAsync = require("../../utils/catchAsync");
const {generateConfirmationCode} = require("../../utils/codeGenerator");
const {filterObject, extractProfileInfo} = require("../../utils/utilitiesFunc");
const AppError = require("../../errors/appError");

exports.updateUserEmail = catchAsync(async (req, res, next) => {
  const {email} = req.body;

  const user = await userService.findOne({_id: req.user.id});

  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
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
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
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
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
  await user.verifyConfirmationCode(confirmationCode);

  await user.updateUserEmail();
  const profile = extractProfileInfo(user);
  res.status(200).json({
    status: "success",
    data: {user: profile},
  });
});

exports.getUserProfileInformation = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
  const profile = extractProfileInfo(user);

  res.status(200).json({
    status: "success",
    data: {user: profile},
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
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }

  const profile = extractProfileInfo(user);

  res.status(200).json({
    status: "success",
    data: {user: profile},
  });
});

exports.deleteUserBio = catchAsync(async (req, res, next) => {
  const user = await userService.findByIdAndUpdate(
    req.user.id,
    {bio: ""},
    {new: true, runValidators: true}
  );
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }

  const profile = extractProfileInfo(user);
  res.status(200).json({
    status: "success",
    data: {user: profile},
  });
});

exports.updateUserPicture = catchAsync(async (req, res, next) => {
  const photo = req.file;
  if (!photo) {
    next(new AppError("No photo uploaded", 400));
    return;
  }

  const user = await userService.getUserById(req.user.id);
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
  await user.updatePictureKey(photo.key);

  const profile = extractProfileInfo(user);
  res.status(200).json({
    status: "success",
    data: {user: profile},
  });
});

exports.deleteUserPicture = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id, "+pictureKey");
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
  await user.deleteUserPicture();

  user.pictureKey = undefined;

  const profile = extractProfileInfo(user);

  res.status(200).json({
    status: "success",
    data: {user: profile},
  });
});

exports.getUserActivity = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
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
  if (!user) {
    next(new AppError("User not found", 404));
    return;
  }
  const data = {
    status: user.status,
    lastSeen: user.lastSeen,
  };
  res.status(200).json({
    status: "success",
    data,
  });
});
