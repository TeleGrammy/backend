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
module.exports = router;
