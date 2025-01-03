const bcrypt = require("bcryptjs");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");
const userDeviceService = require("../../services/userDeviceService");

const catchAsync = require("../../utils/catchAsync");
const sessionManagementModule = require("../../utils/sessionManagement");

/**
 * Logs a user in by validating credentials, managing sessions, and generating tokens.
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */

const login = catchAsync(async (req, res, next) => {
  const {UUID, password, token} = req.body;

  const user = await userService.getUserBasicInfoByUUID(UUID);
  if (!user) {
    return next(new AppError("No user has been found with that UUID", 404));
  }

  if (user.status == "banned" || user.status == "inactive") {
    return res.status(200).json({
      status: "success",
      message: "User is forbiddened to access the application",
    });
  }

  const storedPassword = user.password;
  const isPasswordValid = await bcrypt.compare(password, storedPassword);
  if (!isPasswordValid) {
    return next(new AppError("Wrong password entered", 401));
  }

  if (token) {
    const isExist = await userDeviceService.isDeviceTokenExists(
      token,
      user._id.toString()
    );
    if (!isExist) {
      await userDeviceService.saveDevice(user._id.toString(), token);
    }
    userService.joinFirebaseTopic(user._id.toString(), token);
  }
  const {updatedUser, accessToken} = await sessionManagementModule.default(
    req,
    res,
    user
  );

  return res.status(200).json({
    data: {
      updatedUser,
      accessToken,
    },
    status: "Logged in successfully",
  });
});

module.exports = login;
