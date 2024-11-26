const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");

const AppError = require("../../errors/appError");

exports.getBlockedUsers = catchAsync(async (req, res, next) => {
  console.log(req.user.id);
  const blockedUsers = await userService.getBlockedUsers(req.user.id);

  return res.status(200).json({
    data: {
      blockedUsers,
    },
  });
});

exports.changeBlockingStatus = catchAsync(async (req, res, next) => {
  const blockedUserId = req.body.userId;
  const blockerUserId = req.user.id;
  const chatId = req.body.chatId;

  const action = req.params.action;

  await userService.changeBlockingStatus(
    blockerUserId,
    blockedUserId,
    chatId,
    action
  );

  return res.status(200).json({
    status: "success",
    message:
      action === "block"
        ? "User has been blocked successfully"
        : "User has been unblocked successfully",
  });
});

exports.changeProfileVisibility = catchAsync(async (req, res, next) => {
  const visibilityOptions = {stories: "", profilePicture: "", lastSeen: ""};

  visibilityOptions.profilePicture = req.body.profilePicture;
  visibilityOptions.stories = req.body.stories;
  visibilityOptions.lastSeen = req.body.lastSeen;

  const userId = req.user.id;

  if (
    !["EveryOne", "Contacts", "Nobody"].includes(
      visibilityOptions.profilePicture
    ) ||
    !["EveryOne", "Contacts", "Nobody"].includes(visibilityOptions.stories) ||
    !["EveryOne", "Contacts", "Nobody"].includes(visibilityOptions.lastSeen)
  ) {
    return next(
      new AppError(
        "One of The passed visibility options is not a valid, please check them",
        400
      )
    );
  }

  const updatedUser = await userService.changeProfileVisibilityOptionsByUserId(
    userId,
    visibilityOptions
  );

  if (!updatedUser) {
    return next(
      new AppError(
        "An error has occurred while updating the profile picture's privacy settings",
        500
      )
    );
  }

  return res.status(201).json({
    status: "success",
    data: {
      profilePictureVisibility: updatedUser.profilePictureVisibility,
      storiesVisibility: updatedUser.storiesVisibility,
      lastSeenVisibility: updatedUser.lastSeenVisibility,
    },
    message: "Profile picture visibility option has been set",
  });
});
