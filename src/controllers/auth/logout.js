const AppError = require("../../errors/appError");

const userService = require("../../services/userService");
const sessionService = require("../../services/sessionService");

const logout = async (req, res, next) => {
  try {
    const currentDeviceType = req.headers["user-agent"];
    await sessionService.deleteSession(
      req.user.currentSession._id,
      currentDeviceType
    );

    await userService.findOneAndUpdate(
      {email: req.user.email},
      {status: "inactive"},
      {new: true}
    );

    res.clearCookie(process.env.COOKIE_ACCESS_NAME, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully logged out",
    });
  } catch (err) {
    console.log(err);
    next(new AppError("Logout failed, please try again later", 500));
  }
};

module.exports = logout;
