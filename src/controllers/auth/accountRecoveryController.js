const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userServices = require("../../services/userService");

const mails = require("../../utils/mailTemplate");
const sendEmail = require("../../utils/sendEmail");
const catchAsync = require("../../utils/catchAsync");
const generateToken = require("../../utils/generateToken").default;
const addAuthCookie = require("../../utils/addAuthCookie").default;

const AppError = require("../../errors/appError");

const sendPasswordResetEmail = (req, user) => {
  const resetToken = user.createResetPasswordToken();
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;

  const mail = mails.generateResetPasswordEmail(resetURL, resetToken);

  const msg = {
    to: user.email,
    from: process.env.APP_EMAIL,
    subject: "Reset Password",
    text: mail,
  };

  sendEmail(msg);
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const {email} = req.body;

  if (!email)
    return next(
      new AppError("Email field is required. Please enter your email!", 400)
    );

  const user = await userServices.getUserByEmail(email);

  if (!user) {
    return next(new AppError("We couldn’t find your Email.", 404));
  }

  await sendPasswordResetEmail(req, user);

  user.lastPasswordResetRequestAt = Date.now();
  await user.save({validateBeforeSave: false});

  return res.status(200).json({
    status: "success",
    data: {
      message: "Sent Email successfully. (Valid for 1 hour)",
    },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const {token} = req.params;
  const {password, passwordConfirm} = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userServices.findOne({
    passwordResetToken: hashedToken,
  });

  if (!password || !passwordConfirm)
    return next(
      new AppError("Password and PasswordConfirm are required fields.", 400)
    );

  if (!user) {
    return next(new AppError("The reset token is invalid.", 400));
  }

  if (user.passwordResetTokenExpiresAt < Date.now()) {
    return next(new AppError("The reset token is expired.", 400));
  }

  await userServices.findOneAndUpdate(
    {email: user.email},
    {
      password,
      passwordConfirm,
      $unset: {
        passwordResetToken: "",
        passwordResetTokenExpiresAt: "",
      },
    },
    {
      runValidators: true,
    }
  );

  const userTokenedData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    loggedOutFromAllDevicesAt: Date.now(),
  };

  const newAccessToken = generateToken(
    userTokenedData,
    process.env.COOKIE_ACCESS_NAME
  );

  const newRefreshToken = generateToken(
    userTokenedData,
    process.env.COOKIE_REFRESH_NAME
  );

  addAuthCookie(newAccessToken, res, true);
  addAuthCookie(newRefreshToken, res, false);

  return res.status(200).json({
    status: "success",
    data: {
      message: "The password is reset successfully.",
    },
  });
});

exports.resendResetToken = catchAsync(async (req, res, next) => {
  const {email} = req.body;

  const user = await userServices.getUserByEmail(email);
  if (!user) return next(new AppError("We couldn’t find your Email.", 404));

  const {passwordResetTokenExpiresAt} = user;

  if (!passwordResetTokenExpiresAt || passwordResetTokenExpiresAt < Date.now())
    return next(
      new AppError(
        "The password reset token is invalid. Please use Forget Password option again.",
        400
      )
    );

  const timeSinceLastRequest = Date.now() - user.lastPasswordResetRequestAt;
  const resendCoolDown = 1 * 60 * 1000;

  if (timeSinceLastRequest < resendCoolDown) {
    return next(
      new AppError(
        `You need to wait ${resendCoolDown / 60000} minutes from the last sent reset password email before resending. Please try again later.`,
        400
      )
    );
  }

  await sendPasswordResetEmail(req, user);

  user.lastPasswordResetRequestAt = Date.now();
  await user.save({validateBeforeSave: false});

  return res.status(200).json({
    status: "success",
    data: {
      message: "Resend Email successfully. (Valid for 1 hour)",
    },
  });
});

exports.logOutFromAllDevices = catchAsync(async (req, res, next) => {
  const accessToken = req.cookies[process.env.COOKIE_ACCESS_NAME];
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);

  const {email} = decodedToken;

  const updatedUser = await userServices.findOneAndUpdate(
    {email},
    {loggedOutFromAllDevicesAt: Date.now()},
    {new: true}
  );

  const userTokenedData = {
    id: decodedToken.id,
    name: decodedToken.name,
    email: decodedToken.email,
    phone: decodedToken.phone,
    loggedOutFromAllDevicesAt: updatedUser.loggedOutFromAllDevicesAt,
  };

  const newAccessToken = generateToken(
    userTokenedData,
    process.env.COOKIE_ACCESS_NAME
  );

  const newRefreshToken = generateToken(
    userTokenedData,
    process.env.COOKIE_ACCESS_NAME
  );

  addAuthCookie(newAccessToken, res, true);
  addAuthCookie(newRefreshToken, res, false);

  res.status(200).json({
    status: "success",
    data: {
      message: "logged out successfully from all devices",
    },
  });
});
