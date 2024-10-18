const bcrypt = require("bcryptjs");
const AppError = require("../../errors/appError");
const userService = require("../../services/userService");
const catchAsync = require("../../utils/catchAsync");
const generateToken = require("../../utils/generateToken");
const addAuthCookie = require("../../utils/addAuthCookie");

const login = catchAsync(async (req, res, next) => {
  const {UUID, password} = req.body;

  const user = await userService.getUserBasicInfoByUUID(UUID);
  if (!user) {
    return next(new AppError("No user has been found with that UUID", 404));
  }

  const storedPassword = await userService.getUserPasswordById(user._id);
  const areEqual = await bcrypt.compare(password, storedPassword);
  if (!areEqual) {
    return next(new AppError("Wrong password entered", 401));
  }

  const userTokenedData = {
    id: user._id,
    name: user.username,
    email: user.email,
    phone: user.phone,
  };

  const accessToken = generateToken(
    userTokenedData,
    process.env.COOKIE_ACCESS_NAME
  );
  const refreshToken = generateToken(
    userTokenedData,
    process.env.COOKIE_REFRESH_NAME
  );

  addAuthCookie(accessToken, res, true);

  addAuthCookie(refreshToken, res, false);

  return res.status(200).json({
    data: {
      user,
      accessToken,
      refreshToken,
    },
    status: "Logged in successfully",
  });
});

module.exports = login;
