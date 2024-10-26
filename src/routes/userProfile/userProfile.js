const express = require("express");
const userProfileController = require("../../controllers/userProfile/userProfile");
const storyController = require("../../controllers/userProfile/story");

const {uploadUserPicture, uploadStory} = require("../../middlewares/AWS");

const router = express.Router();

router.get("/:id", userProfileController.getUserProfileInformation);
// to update the user (bio , username , screen name or phone)
router.patch("/:id", userProfileController.updateUserProfileInformation);

// the status also should be changed when using the web socket
router
  .route("/status/:id")
  .get(userProfileController.getUserActivity)
  .patch(userProfileController.updateUserActivity);

router.patch(
  "/picture/:id",
  uploadUserPicture,
  userProfileController.updateUserPicture
);
router.delete("/picture/:id", userProfileController.deleteUserPicture);

router.patch("/email/:id", userProfileController.updateUserEmail);
router.patch(
  "/email/new-code/:id",
  userProfileController.requestNewConfirmationCode
);
router.post("/email/confirm/:id", userProfileController.confirmNewEmail);

router.delete("/bio/:id", userProfileController.deleteUserBio);

router
  .route("/story/:id")
  .post(uploadStory, storyController.createStory)
  .get(storyController.getStories)
  .delete(storyController.deleteStory);
// get story by id of the story
router.get("/story//:id", storyController.getStory);
module.exports = router;
