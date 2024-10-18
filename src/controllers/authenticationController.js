const userServices = require("../services/userServices");
const mails = require("../utils/mails");
const sendEmail = require("../utils/sendEmail");
const AppError = require("../errors/appError");
const catchAsync = require("../utils/catchAsync");

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
