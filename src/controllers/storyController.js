const Story = require("./../models/storyModel");
const User = require("./../models/user");
const {AppError, handleError} = require("../errors/appError");

exports.createStory = async (req, res) => {
  try {
    const {content} = req.body;
    const mediaKey = req.file ? req.file.key : null;
    if (!content && !mediaKey) {
      throw new AppError("No content or media provided.", 400);
    }
    const user = await User.findById(req.params.id);

    const story = await Story.create({
      user: user._id,
      content: content,
      mediaKey,
    });

    res.status(201).json({
      status: "success",
      data: story,
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

// TODO : add the update method if it exists

// TODO : check if the user requsting stories of another user is possible to get them
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.id,
      expiresAt: {$gte: Date.now()},
    });
    res.json({
      status: "success",
      data: stories,
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      throw new AppError("Story not found", 404);
    }
    res.json({
      status: "success",
      data: story,
    });
  } catch (err) {
    handleError(err, req, res);
  }
};

// TODO : should be handled in authorization
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.body.id);

    if (!story) {
      throw new AppError("Story not found or not authorized to delete", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Story deleted successfully",
    });
  } catch (err) {
    handleError(err, req, res);
  }
};
