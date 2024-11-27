const express = require("express");
const groupController = require("../../controllers/group/groupController");
const isAuthenticated = require("../../middlewares/isAuthenticated");

const router = express.Router();

router.route("/").post(isAuthenticated, groupController.addNewGroup);
router
  .route("/:groupId")
  .get(groupController.findGroup)
  .delete(isAuthenticated, groupController.deleteGroup);
router
  .route("/:groupId/participants")
  .delete(isAuthenticated, groupController.leaveGroup);

router
  .route("/:groupId/admins/:userId")
  .patch(isAuthenticated, groupController.addAdmin);
router
  .route("/:groupId/users/:userId")
  .patch(isAuthenticated, groupController.addMember);

module.exports = router;
