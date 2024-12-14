const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userServices = require("../../services/userService");

const mails = require("../../utils/mailTemplate");
const sendEmail = require("../../utils/sendEmail");
const catchAsync = require("../../utils/catchAsync");
const manageSessionForUser = require("../../utils/sessionManagement");

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

const forgetPassword = catchAsync(async (req, res, next) => {
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
    data: {},
    message: `Sent Email successfully. (Valid for ${process.env.RESET_PASSWORD_TOKEN_DURATION} minutes)`,
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
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
  if (password !== passwordConfirm) {
    return next(
      new AppError("Password and passwordConfirm are different.", 400)
    );
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

  const {updatedUser, accessToken} = await manageSessionForUser.default(
    req,
    res,
    user
  );
  updatedUser.password = undefined;

  return res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
      accessToken,
    },
    message: "The password is reset successfully.",
  });
});

const resendResetToken = catchAsync(async (req, res, next) => {
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
  const resendCoolDown = process.env.RESEND_PASSWORD_TOKEN_COOLDOWN * 60 * 1000;

  if (timeSinceLastRequest < resendCoolDown) {
    return next(
      new AppError(
        `You need to wait ${process.env.RESEND_PASSWORD_TOKEN_COOLDOWN} minutes from the last sent reset password email before resending. Please try again later.`,
        400
      )
    );
  }

  await sendPasswordResetEmail(req, user);

  user.lastPasswordResetRequestAt = Date.now();
  await user.save({validateBeforeSave: false});

  return res.status(200).json({
    status: "success",
    data: {},
    message: `Resend Email successfully. (Valid for ${process.env.RESET_PASSWORD_TOKEN_DURATION} minutes)`,
  });
});

const logOutFromAllDevices = catchAsync(async (req, res, next) => {
  const currentAccessToken =
    req.cookies[process.env.COOKIE_ACCESS_NAME] ||
    req.headers.authorization?.split(" ")[1] ||
    req.headers.Authorization?.split(" ")[1];

  const decodedToken = jwt.verify(currentAccessToken, process.env.JWT_SECRET);

  const {email} = decodedToken;

  const user = await userServices.findOneAndUpdate(
    {email},
    {loggedOutFromAllDevicesAt: Date.now()},
    {new: true}
  );

  const {updatedUser, accessToken} = await manageSessionForUser.default(
    req,
    res,
    user
  );
  updatedUser.password = undefined;

  res.status(200).json({
    status: "success",
    data: {
      user,
      accessToken,
    },
    message: "logged out successfully from all devices",
  });
});

const redirectResetPage = catchAsync(async (req, res, next) => {
  const resetURL = `${process.env.SET_PASSWORD_URL}/${req.params.token}`;
  res.redirect(resetURL);
});

module.exports = {
  sendPasswordResetEmail,
  forgetPassword,
  resetPassword,
  resendResetToken,
  logOutFromAllDevices,
  redirectResetPage,
};
