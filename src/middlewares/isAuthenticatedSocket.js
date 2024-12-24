const jwt = require("jsonwebtoken");
const AppError = require("../errors/appError");

const isAuthenticatedSocket = async (socket, next) => {
  let token =
    socket.handshake.headers.authorization || socket.handshake.query.token;
  if (token.startsWith("Bearer ")) {
    token = token.replace("Bearer ", "");
  }
  let decodedAccessToken = null;
  try {
    decodedAccessToken = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decodedAccessToken;
  } catch (error) {
    return next(
      new AppError("Invalid refresh token, please log in again", 401)
    );
  }
  return next();
};

module.exports = isAuthenticatedSocket;
