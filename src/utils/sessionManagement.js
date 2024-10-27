const userService = require("../services/userService");
const sessionService = require("../services/sessionService");

const generateToken = require("../utils/generateToken");
const addAuthCookie = require("../utils/addAuthCookie");

const manageSessionForUser = async (req, res, user) => {
  const currentDeviceType = req.headers["user-agent"];

  const userTokenedData = {
    id: user._id,
    name: user.username,
    email: user.email,
    phone: user.phone,
    loggedOutFromAllDevicesAt: user.loggedOutFromAllDevicesAt,
  };

  const accessToken = generateToken(
    userTokenedData,
    process.env.COOKIE_ACCESS_NAME
  );

  const refreshToken = generateToken(
    userTokenedData,
    process.env.COOKIE_REFRESH_NAME
  );

  const sessionData = {
    ip: (req.headers["x-forwarded-for"] || req.connection.remoteAddress)
      .split(",")[0]
      .trim(),
    deviceType: currentDeviceType,
    userId: user._id,
    refreshToken,
  };

  const currentSession = await sessionService.findSessionByUserIdAndUpdate(
    user._id,
    currentDeviceType,
    sessionData
  );

  if (!currentSession) {
    await sessionService.createSession(sessionData);
  }

  const updatedUser = await userService.findOneAndUpdate(
    {email: user.email},
    {status: "active"},
    {new: true}
  );

  addAuthCookie(accessToken, res, true);

  return {updatedUser, accessToken};
};

module.exports = manageSessionForUser;
