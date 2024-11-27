const userService = require("../../services/userService");
const channelService = require("../../services/channelService");
const groupService = require("../../services/groupService");
const memberShipService = require("../../services/memberShipService");

const catchAsync = require("../../utils/catchAsync");

const AppError = require("../../errors/appError");

const {seedData} = require("../../models/seeds/memberShipSeed");

const executeSeed = catchAsync(async (req, res, next) => {
  seedData().catch(console.error);

  return res.status(200).json({
    status: "success",
    message: "seed is inserted successfully",
  });
});

const changeReadReceiptsStatus = catchAsync(async (req, res, next) => {
  const {isEnabled} = req.body;
  const userId = req.user.id;

  if (isEnabled !== true && isEnabled !== false) {
    return next(
      new AppError(
        "Invalid action. Enabling status should boolean values only, please check them",
        400
      )
    );
  }

  const updatedUser = await userService.setReadReceiptsStatus(
    userId,
    isEnabled
  );

  if (!updatedUser) {
    return next(
      new AppError(
        "An error has occurred while updating the read receipts settings",
        500
      )
    );
  }

  return res.status(201).json({
    status: "success",
    data: {
      isEnabled,
    },
  });
});

const getBlockedUsers = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const blockedUsers = await userService.getBlockedUsers(userId);

  return res.status(200).json({
    data: {
      blockedUsers,
    },
  });
});

const changeBlockingStatus = catchAsync(async (req, res, next) => {
  const blockedUserId = req.body.userId;
  const blockerUserId = req.user.id;
  const {chatId} = req.body;

  const {action} = req.params;

  if (action !== "block" && action !== "unblock") {
    return new AppError(
      "Invalid action. Use 'block' or 'unblock', please check them",
      400
    );
  }

  const updatedUser = await userService.changeBlockingStatus(
    blockerUserId,
    blockedUserId,
    chatId,
    action
  );

  if (!updatedUser) {
    return next(
      new AppError(
        "An error has occurred while updating the blocking status",
        500
      )
    );
  }

  return res.status(200).json({
    status: "success",
    message:
      action === "block"
        ? "User has been blocked successfully"
        : "User has been unblocked successfully",
  });
});

const changeProfileVisibility = catchAsync(async (req, res, next) => {
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
        "Invalid action. One or more of the passed visibility options not valid, please check them",
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
        "An error has occurred while updating the profile's privacy settings",
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

const changeGroupControlStatus = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const {newPolicy} = req.body;

  if (newPolicy !== "Admins" && newPolicy !== "EveryOne") {
    next(
      new AppError(
        "Invalid action. The value of policy isn't valid, please check them",
        400
      )
    );
  }

  const adminMemberShips = await memberShipService.getAdminMemberShips(userId);

  const groupIds = adminMemberShips
    .filter((memberShip) => memberShip.entityType === "Group")
    .map((memberShip) => memberShip.entityId);

  const channelIds = adminMemberShips
    .filter((memberShip) => memberShip.entityType === "Channel")
    .map((memberShip) => memberShip.entityId);

  if (channelIds.length > 0) {
    await channelService.changeChannelsPolicy(channelIds, newPolicy);
  }

  if (groupIds.length > 0) {
    await groupService.changeGroupsPolicy(groupIds, newPolicy);
  }

  return res.status(200).json({
    status: "success",
    data: {
      newPolicy,
    },
  });
});

module.exports = {
  executeSeed,
  changeProfileVisibility,
  changeBlockingStatus,
  changeReadReceiptsStatus,
  changeGroupControlStatus,
  getBlockedUsers,
};