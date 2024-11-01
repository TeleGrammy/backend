const bcrypt = require("bcryptjs");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

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
  const {UUID, password} = req.body;

  const user = await userService.getUserBasicInfoByUUID(UUID);
  if (!user) {
    return next(new AppError("No user has been found with that UUID", 404));
  }

  const storedPassword = user.password;
  const isPasswordValid = await bcrypt.compare(password, storedPassword);
  if (!isPasswordValid) {
    return next(new AppError("Wrong password entered", 401));
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
