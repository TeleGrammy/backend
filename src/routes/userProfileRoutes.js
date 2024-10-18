const express = require("express");
const userController = require("./../controllers/userController");
const {uploadUserPicture} = require("../middlewares/multer");

const router = express.Router();

router.patch(
  "/picture/:id",
  uploadUserPicture,
  userController.updateUserPicture
);

router.patch("/email/:id", userController.updateUserEmail);
router.patch("/email/new-code/:id", userController.requestNewConfirmationCode);
router.post("/email/confirm/:id", userController.confirmNewEmail);

// to update the user (bio , username , screen name or phone)
router.patch("/information/:id", userController.updateUserInformation);
router.delete("/bio/:id", userController.deleteUserBio);

module.exports = router;
