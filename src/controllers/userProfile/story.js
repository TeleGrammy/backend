const Story = require("../../models/story");
const User = require("../../models/user");
const AppError = require("../../errors/appError");
const catchAsync = require("../../utils/catchAsync");

exports.createStory = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  if (!content && !mediaKey) {
    next(new AppError("No content or media provided.", 400));
  }
  const user = await User.findById(req.user.id);

  const story = await Story.create({
    user: user._id,
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
  const stories = await Story.find({
    user: req.user.id,
    expiresAt: {$gte: Date.now()},
  });
  res.json({
    status: "success",
    data: stories,
  });
});
exports.getUserStories = catchAsync(async (req, res, next) => {
  const {contacts} = await User.findById(req.user.id);
  const storiesOwnerId = req.params.id;
  if (!contacts.includes(storiesOwnerId)) {
    next(new AppError("You are not authorized to view this User stories", 403));
  }

  const stories = await Story.find({
    user: storiesOwnerId,
    expiresAt: {$gte: Date.now()},
  });
  res.json({
    status: "success",
    data: stories,
  });
});

exports.getStory = catchAsync(async (req, res, next) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    next(new AppError("Story not found", 404));
  }
  res.json({
    status: "success",
    data: story,
  });
});

exports.deleteStory = catchAsync(async (req, res, next) => {
  let story = await Story.find({
    _id: req.body.id,
    user: req.user.id,
  });
  if (!story) {
    next(new AppError("Story not found or not authorized to delete", 404));
  }
  story = await Story.findByIdAndDelete(req.body.id);
  res.status(200).json({
    status: "success",
    message: "Story deleted successfully",
  });
});
