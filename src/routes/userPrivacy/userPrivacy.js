const express = require("express");
const userPrivacyController = require("../../controllers/userPrivacy/userPrivacy");

const isAuth = require("../../middlewares/isAuthenticated");

const router = express.Router();

router.get("/get-blocked-users", isAuth, userPrivacyController.getBlockedUsers);

router.post("/seed", userPrivacyController.executeSeed);

router.patch(
  "/blocking-status/:action",
  isAuth,
  userPrivacyController.changeBlockingStatus
);

router.patch(
  "/group-control",
  isAuth,
  userPrivacyController.changeGroupControlStatus
);

router.patch(
  "/read-receipts",
  isAuth,
  userPrivacyController.changeReadReceiptsStatus
);

router.patch(
  "/profile-visibility",
  isAuth,
  userPrivacyController.changeProfileVisibility
);

module.exports = router;