const express = require("express");
const userController = require("./../controllers/userController");

const router = express.Router();

router.patch("/email/:id", userController.updateUserEmail);
router.patch("/bio/:id", userController.updateUserBio);
router.patch("/username/:id", userController.updateUserName);
router.patch("/phone/:id", userController.updateUserPhone);
router.patch("/email/new-code/:id", userController.requestNewConfirmationCode);
router.post("/email/confirm/:id", userController.confirmNewEmail);
module.exports = router;
