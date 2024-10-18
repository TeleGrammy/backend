const crypto = require("crypto");
const userServices = require("../services/userServices");
const mails = require("../utils/mails");
const sendEmail = require("../utils/sendEmail");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");
const createJWT = require("../utils/createJWT");

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

  if (user === null) {
    return next(new AppError("We couldn’t find your Email.", 404));
  }

  await sendPasswordResetEmail(req, user);

  user.lastPasswordResetRequestAt = Date.now();
  await user.save({validateBeforeSave: false});

  return res.status(200).json({
    status: "success",
    message: "Sent Email successfully. (Valid for 1 hour)",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const {token} = req.params;
  const {password, passwordConfirm} = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userServices.findOne({
    passwordResetToken: hashedToken,
  });

  if (!user) {
    return next(new AppError("The reset token is invalid.", 400));
  }

  if (user.passwordResetTokenExpiresAt < Date.now()) {
    return next(new AppError("The reset token is expired.", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;

  await user.save();
  // eslint-disable-next-line no-underscore-dangle
  const jwt = createJWT(user._id);
  res.cookie("JWT", jwt, {httpOnly: true, secure: true, sameSite: "strict"});

  return res.status(200).json({
    status: "success",
    data: {
      message: "The password is reset successfully.",
    },
  });
});
