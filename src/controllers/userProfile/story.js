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
  const user = await User.findById(req.params.id);

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

// TODO : check if the user requsting stories of another user is possible to get them
exports.getStories = catchAsync(async (req, res, next) => {
  const stories = await Story.find({
    user: req.params.id,
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

// TODO : should be handled in authorization
exports.deleteStory = catchAsync(async (req, res, next) => {
  const story = await Story.findByIdAndDelete(req.body.id);

  if (!story) {
    next(new AppError("Story not found or not authorized to delete", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Story deleted successfully",
  });
});
