const Story = require("./../models/storyModel");
const User = require("./../models/userModel");
const {generateSignedUrl, deleteFile} = require("../middlewares/AWS");

exports.createStory = async (req, res) => {
  const {content} = req.body;
  const mediaKey = req.file ? req.file.key : null;
  try {
    if (!content && !mediaKey) {
      const err = new Error("No content or media provided.");
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    let signedUrl = null;
    if (mediaKey) signedUrl = await generateSignedUrl(mediaKey, 24 * 60 * 60); // URL valid for 1 day

    const story = await Story.create({
      user: user._id,
      content: content,
      media: signedUrl,
      mediaKey
    });

    story.mediaKey = undefined;
    res.status(201).json({
      status: "success",
      data: story
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.id,
      expiresAt: {$gte: Date.now()}
    });
    res.json({
      status: "success",
      data: stories
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.body.id).select(
      "+mediaKey"
    );

    // should be handled in authorization
    if (!story) {
      const err = new Error("Story not found or not authorized to delete.");
      err.statusCode = 404;
      throw err;
    }

    if (story.mediaKey) await deleteFile(story.mediaKey);
    res.status(200).json({
      status: "success",
      message: "Story deleted successfully"
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: err.statusCode ? "failed" : "error",
      message: err.message
    });
  }
};
