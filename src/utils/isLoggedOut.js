const userService = require("../services/userService");

const isLoggedOut = async (decodedToken) => {
  const user = await userService.getUserByEmail(decodedToken.email);
  if (
    !user.loggedOutFromAllDevicesAt ||
    user.loggedOutFromAllDevicesAt === decodedToken.loggedOutFromAllDevicesAt
  ) {
    return false;
  }
  return true;
};

module.exports = isLoggedOut;
