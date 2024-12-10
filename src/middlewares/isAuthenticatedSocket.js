const jwt = require("jsonwebtoken");

const isAuthenticatedSocket = async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  let decodedAccessToken = null;
  try {
    decodedAccessToken = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decodedAccessToken;
  } catch (error) {
    return next(new Error("Invalid refresh token, please log in again", 401));
  }
  return next();
};

module.exports = isAuthenticatedSocket;
