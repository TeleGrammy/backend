const jwt = require("jsonwebtoken");
const {Server} = require("socket.io");
const socketConfig = require("./config/socketConfig");
const {onConnection} = require("./eventHandlers/connection");

const AppError = require("./errors/appError");

const createIoApp = (httpServer) => {
  const io = new Server(httpServer, socketConfig);
  module.exports.io = io;
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    console.log("Connecting Attempt");
    let decodedAccessToken = null;
    try {
      decodedAccessToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decodedAccessToken);
      socket.user = decodedAccessToken;
    } catch (error) {
      console.log(error);
      return next(new Error("Invalid refresh token, please log in again", 401));
    }
    return next();
  });

  io.on("connection", (socket) => onConnection(socket, io));
};

module.exports = createIoApp;
