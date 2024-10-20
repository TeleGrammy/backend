const express = require("express");
const userController = require("./../controllers/userController");
const {uploadUserPicture, uploadStory} = require("../middlewares/AWS");
const storyController = require("./../controllers/storyController");

const router = express.Router();

router.get("/:id", userController.getUserProfileInformation);
// to update the user (bio , username , screen name or phone)
router.patch("/:id", userController.updateUserInformation);

// the status also should be changed when using the web socket
router
  .route("/status")
  .get(userController.getUserActivity)
  .patch(userController.updateUserActivity);

router.patch(
  "/picture/:id",
  uploadUserPicture,
  userController.updateUserPicture
);
router.delete("/picture/:id", userController.deleteUserPicture);

router.patch("/email/:id", userController.updateUserEmail);
router.patch("/email/new-code/:id", userController.requestNewConfirmationCode);
router.post("/email/confirm/:id", userController.confirmNewEmail);

router.delete("/bio/:id", userController.deleteUserBio);

router
  .route("/story/:id")
  .post(uploadStory, storyController.createStory)
  .get(storyController.getStories)
  .delete(storyController.deleteStory);
// get story by id of the story
router.get("/story//:id", storyController.getStory);
module.exports = router;
