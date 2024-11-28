const stroyService = require("../../services/storyService");

const userService = require("../../services/userService");

const AppError = require("../../errors/appError");
const catchAsync = require("../../utils/catchAsync");

exports.createStory = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  if (!content && !mediaKey) {
    return next(new AppError("No content or media provided.", 400));
  }
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const story = await stroyService.create({
    userId: user._id,
    content,
    mediaKey,
  });

  res.status(201).json({
    status: "success",
    data: story,
  });
});

// TODO : add the update method if it exists

exports.getMyStories = catchAsync(async (req, res, next) => {
  const stories = await stroyService.getStoriesByUserId(req.user.id);
  res.json({
    status: "success",
    data: stories,
  });
});

exports.getMyContactsStories = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 50;
  limit = limit > 10 ? 10 : limit;
  const stories = await stroyService.getStoriesOfContacts(
    req.user.id,
    page,
    limit
  );
  res.json({
    status: "success",
    data: stories,
  });
});

exports.addStoryOwnerId = catchAsync(async (req, res, next) => {
  req.storyId = req.params.stroyId;

  const story = await stroyService.getStoryById(req.storyId);
  if (!story) {
    return next(new AppError("Story not found", 404));
  }
  req.storyOwnerId = story.userId;
  next();
});

exports.inContacts = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const storiesOwnerId = req.params.userId || req.storyOwnerId.toString();
  req.storyOwnerId = storiesOwnerId;

  if (
    !Array.isArray(user.contacts) &&
    !user.contacts.includes(storiesOwnerId) &&
    !(storiesOwnerId === req.user.id)
  ) {
    return next(
      new AppError("You are not authorized to view this stories", 403)
    );
  }
  next();
});
exports.getUserStories = catchAsync(async (req, res, next) => {
  const storiesOwnerId = req.storyOwnerId;
  const stories = await stroyService.getStoriesByUserId(storiesOwnerId);
  res.json({
    status: "success",
    data: stories,
  });
});

exports.getStory = catchAsync(async (req, res, next) => {
  const story = await stroyService.getStoryById(req.storyId);
  if (!story) {
    return next(new AppError("Story not found", 404));
  }
  res.json({
    status: "success",
    data: story,
  });
});

exports.checkAuthorization = catchAsync(async (req, res, next) => {
  const story = await stroyService.getStoryById(req.params.storyId);
  if (!story) {
    return next(new AppError("Story not found", 404));
  }

  if (story.userId.toString() !== req.user.id) {
    return next(new AppError("User not authorized to view this story", 403));
  }
  next();
});

exports.deleteStory = catchAsync(async (req, res, next) => {
  await stroyService.deleteStoryById(req.params.storyId);
  res.status(200).json({
    status: "success",
    message: "Story deleted successfully",
  });
});

exports.updateStoryViewers = catchAsync(async (req, res, next) => {
  const {storyId} = req.params;
  const story = await stroyService.updateStoryViewers(storyId, req.user.id);
  if (!story) {
    return next(new AppError("Story not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {story},
  });
});
