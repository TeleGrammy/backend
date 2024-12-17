const AppError = require("../../errors/appError");

const userService = require("../../services/userService");
const userDeviceService = require("../../services/userDeviceService");
const sessionService = require("../../services/sessionService");

const logout = async (req, res, next) => {
  try {
    const currentDeviceType = req.headers["user-agent"];

    if (req.body && req.user && req.user._id) {
      const {token} = req.body;
      userService.unjoinFirebaseTopic(req.user._id.toString(), token);
      userDeviceService.removeDeviceByToken(token);
    }
    if (!req.user.currentSession) {
      res.status(200).json({
        status: "success",
        message: "Successfully logged out",
      });
      return;
    }
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
    next(new AppError("Logout failed, please try again later", 500));
  }
};

module.exports = logout;
