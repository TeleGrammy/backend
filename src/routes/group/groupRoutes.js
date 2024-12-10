const express = require("express");
const groupController = require("../../controllers/group/groupController");

const router = express.Router();

router.route("/:groupId").get(groupController.findGroup);

router
  .route("/:groupId/admins/:userId")
  .patch(groupController.addAdmin)
  .delete(groupController.removeAdmin);

router.route("/:groupId/size").patch(groupController.updateGroupLimit);

router.route("/:groupId/group-type").patch(groupController.updateGroupType);

router.route("/:groupId/members").get(groupController.membersList);

router.route("/:groupId/admins").get(groupController.adminsList);

router
  .route("/:groupId/mute-notification")
  .patch(groupController.muteNotification);

router
  .route("/:groupId/members/:memberId/permissions")
  .patch(groupController.updateMemberPermission);

router
  .route("/:groupId/admins/:adminId/permissions")
  .patch(groupController.updateAdminPermission);

router.route("/:groupId/info").patch(groupController.updateGroupBasicInfo);

module.exports = router;
