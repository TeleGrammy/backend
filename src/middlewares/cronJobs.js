const cron = require("node-cron");
const Story = require("../models/storyModel");
const {deleteFile} = require("./AWS");

const scheduleCronJobs = () => {
  // Schedule the job to run daily at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const expiredStories = await Story.find({expiresAt: {$lte: now}});

      expiredStories.forEach(async story => {
        try {
          if (story.mediaKey) await deleteFile(story.mediaKey);
        } catch (e) {
          console.error(`Error deleting story ${story._id}:`, e);
        }
      });

      await Story.deleteMany({expiresAt: {$lte: now}});

      // console.log("Expired stories deleted successfully!");
    } catch (err) {
      console.error("Error deleting expired stories:", err);
    }
  });
};

module.exports = scheduleCronJobs;
