const express = require("express");
const groupController = require("../../controllers/group/groupController");
const {
  groupExists,
  isRegularMember,
  isAdmin,
} = require("../../middlewares/groupMiddlewares");

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

router
  .route("/:groupId/pin-message/:messageId")
  .patch(groupExists, isAdmin, groupController.pinMessage);

router
  .route("/:groupId/unpin-message/:messageId")
  .patch(groupExists, isAdmin, groupController.unpinMessage);

router
  .route("/:groupId/download-media/:messageId")
  .get(groupExists, isAdmin, isRegularMember, groupController.downloadMedia);

module.exports = router;
