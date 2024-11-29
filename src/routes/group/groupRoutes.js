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
  .patch(isAuthenticated, groupController.addAdmin)
  .delete(isAuthenticated, groupController.removeAdmin);
router
  .route("/:groupId/users/:userId")
  .patch(isAuthenticated, groupController.addMember);

router
  .route("/:groupId/size")
  .patch(isAuthenticated, groupController.updateGroupLimit);

router
  .route("/:groupId/group-type")
  .patch(isAuthenticated, groupController.updateGroupType);

router
  .route("/:groupId/members")
  .get(isAuthenticated, groupController.membersList);

router
  .route("/:groupId/admins")
  .get(isAuthenticated, groupController.adminsList);

router
  .route("/:groupId/mute-notification")
  .patch(isAuthenticated, groupController.muteNotification);

router
  .route("/:groupId/members/:memberId/permissions")
  .patch(isAuthenticated, groupController.updateMemberPermission);
module.exports = router;
