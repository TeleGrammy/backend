const express = require("express");
const userController = require("./../controllers/userController");
const {uploadUserPicture} = require("../middlewares/AWS");

const router = express.Router();

router.get("/:id", userController.getUserProfileInformation);
// to update the user (bio , username , screen name or phone)
router.patch("/:id", userController.updateUserInformation);

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

module.exports = router;
