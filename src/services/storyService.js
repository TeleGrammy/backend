const Story = require("../models/story");
const User = require("../models/user");
const {getBasicProfileInfo} = require("../services/userProfileService");
const {generateSignedUrl} = require("../middlewares/AWS");

exports.create = async (data) => {
  const {userId, content, mediaKey, mediaType} = data;
  return Story.create({userId, content, mediaKey, mediaType});
};

exports.getStoriesByUserId = async (userId) => {
  return Story.find({userId, expiresAt: {$gte: Date.now()}}).sort({
    expiresAt: -1,
  });
};
exports.getStoryById = async (id) => {
  return Story.findOne({_id: id, expiresAt: {$gt: Date.now()}});
};

exports.getStoriesOfContacts = async (id, page, limit) => {
  const {contacts} = await User.findById(id).populate("contacts.contactId");
  const contactIds = contacts.map((contact) => contact.contactId._id);

  const docs = await Story.aggregate([
    {
      $match: {userId: {$in: contactIds}, expiresAt: {$gte: new Date()}},
    },

    {
      $sort: {expiresAt: -1},
    },
    {
      $group: {
        _id: "$userId", // Group by userId
        stories: {$push: "$$ROOT"}, // Include full story data in an array for each user
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  await Promise.all(
    docs.map(async (user) => {
      user.profile = await getBasicProfileInfo(user._id);
      await Promise.all(
        user.stories.map(async (story) => {
          try {
            if (story.mediaKey)
              story.media = await generateSignedUrl(story.mediaKey, 15 * 60);
          } catch (err) {
            console.error(`Error generating url for story ${story._id}:`, err);
            story.media = null;
          }
          story.mediaKey = undefined;
          if (story.viewers) {
            const arr = Object.values(story.viewers); // Converts viewers (JSON object) to an array of [key, value] pairs
            await Promise.all(
              arr.map(async (obj) => {
                obj.profile = await getBasicProfileInfo(obj.viewerId);
              })
            );
          }
        })
      );
    })
  );

  return docs;
};
exports.deleteStoryById = async (id) => {
  return Story.findByIdAndDelete(id);
};

exports.updateStoryViewers = async (storyId, userId) => {
  return Story.findByIdAndUpdate(
    storyId,
    {
      $set: {
        [`viewers.${userId}`]: {
          viewedAt: new Date(),
          viewerId: userId,
        },
      },
    },
    {new: true, runValidators: true}
  );
};
