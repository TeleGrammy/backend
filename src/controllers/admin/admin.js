const catchAsync = require("../../utils/catchAsync");

const AppError = require("../../errors/appError");

const adminService = require("../../services/adminService");
const groupService = require("../../services/groupService");

const validStatuses = ["banned", "active", "inactive"];

const getRegisteredUsers = catchAsync(async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const registeredUsers = await adminService.getUsers(adminId);

    return res.status(200).json({
      status: "success",
      data: registeredUsers,
    });
  } catch (error) {
    return next(error);
  }
});

const changeUserStatus = catchAsync(async (req, res, next) => {
  try {
    const {userId} = req.params;
    const {status} = req.body;

    if (!validStatuses.includes(status)) {
      throw new AppError(
        "Invalid status. Allowed values are 'banned', 'active', or 'inactive'",
        400
      );
    }

    const restrictedUser = await adminService.restrictUser(
      userId,
      {status},
      {new: true}
    );

    if (!restrictedUser) {
      throw new AppError(
        "An error ocuured while updating the user's status",
        500
      );
    }

    return res.status(200).json({
      status: "success",
      data: restrictedUser,
    });
  } catch (error) {
    return next(error);
  }
});

const applyFilterContents = catchAsync(async (req, res, next) => {
  try {
    const {groupId} = req.params;
    const {applyFilter} = req.body;

    const updatedGroup = await groupService.findAndUpdateGroup(
      groupId,
      {applyFilter},
      {new: true}
    );

    if (!updatedGroup) {
      throw new AppError("An error occurred while updating the group", 500);
    }

    return res.status(200).json({
      status: "success",
      message: "Group's filtering status has been updated",
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  getRegisteredUsers,
  changeUserStatus,
  applyFilterContents,
};
