const express = require("express");
const userProfileController = require("../../controllers/userProfile/userProfile");

const isAuth = require("../../middlewares/isAuthenticated");

const {uploadUserPicture} = require("../../middlewares/AWS");

const router = express.Router();

// to get or update the user profile information.  update only these parameters(bio , username , screen name or phone)
router
  .route("/")
  .get(isAuth, userProfileController.getUserProfileInformation)
  .patch(isAuth, userProfileController.updateUserProfileInformation);

// TODO: the status also should be changed when using the web socket
router
  .route("/status/")
  .get(isAuth, userProfileController.getUserActivity)
  .patch(isAuth, userProfileController.updateUserActivity);

router.patch(
  "/picture/",
  isAuth,
  uploadUserPicture,
  userProfileController.updateUserPicture
);
router.delete("/picture/", isAuth, userProfileController.deleteUserPicture);

router.patch("/email/", isAuth, userProfileController.updateUserEmail);
router.patch(
  "/email/new-code/",
  isAuth,
  userProfileController.requestNewConfirmationCode
);
router.post("/email/confirm/", isAuth, userProfileController.confirmNewEmail);

router.delete("/bio/", isAuth, userProfileController.deleteUserBio);

module.exports = router;
