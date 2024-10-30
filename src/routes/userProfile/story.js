const express = require("express");

const storyController = require("../../controllers/userProfile/story");
const isAuth = require("../../middlewares/isAuthenticated");

const {uploadStory} = require("../../middlewares/AWS");

const router = express.Router();
router
  .route("/")
  .post(isAuth, uploadStory, storyController.createStory)
  .get(isAuth, storyController.getMyStories)
  .delete(isAuth, storyController.deleteStory);

router.get("/contacts", isAuth, storyController.getMyContactsStories);

// get stories of a user by it's id
router.get(
  "/:userId",
  isAuth,
  storyController.inContacts,
  storyController.getUserStories
);
// get story by id of the story
router.get(
  "/story/:stroyId",
  isAuth,
  storyController.addStoryOwnerId,
  storyController.inContacts,
  storyController.getStory
);

router.delete(
  "/:storyId",
  isAuth,
  storyController.checkAuthorization,
  storyController.deleteStory
);

router.patch("/:storyId/view", isAuth, storyController.updateStoryViewers);

module.exports = router;
