const bcrypt = require("bcryptjs");

const AppError = require("../../errors/appError");

const userService = require("../../services/userService");

const catchAsync = require("../../utils/catchAsync");
const generateToken = require("../../utils/generateToken");
const addAuthCookie = require("../../utils/addAuthCookie");

const login = catchAsync(async (req, res, next) => {
  const UUID = req.body.UUID;
  const user = await userService.getUserBasicInfoByUUID(UUID);
  if (!user) {
    return next(new AppError("No user has been found with that UUID", 404));
  }

  const password = await userService.getUserPassword(user.id);

  const areEqual = await bcrypt.compare(req.body.password, password);
  if (!areEqual) {
    return next(new AppError("Wrong password is entered", 401));
  }

  const token = generateToken(user.id);
  addAuthCookie(token, res);

  return res.status(200).json({
    data: {
      user,
      token,
    },
    status: "Logged in successfully",
  });
});

module.exports = login;
