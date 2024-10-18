const express = require("express");
const userController = require("./../controllers/userController");

const router = express.Router();

router.patch(
  "/picture",
  userController.uploadUserPhoto,
  userController.updateUserPicture
);

router.patch("/email/:id", userController.updateUserEmail);
router.patch("/email/new-code/:id", userController.requestNewConfirmationCode);
router.post("/email/confirm/:id", userController.confirmNewEmail);

// to update the useer bio or the screen name
router.patch("/information/:id", userController.updateUserInformation);
router.delete("/bio/:id", userController.deleteUserBio);

module.exports = router;
