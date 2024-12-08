const jwt = require("jsonwebtoken");
const {Server} = require("socket.io");
const socketConfig = require("./config/socketConfig");
const {onConnection} = require("./eventHandlers/connection");

const createIoApp = (httpServer) => {
  console.log("Setup Socket.IO");
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow any origin for testing. Restrict this in production.
    },
  });
  module.exports.io = io;
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    let decodedAccessToken = null;
    try {
      decodedAccessToken = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decodedAccessToken;
    } catch (error) {
      return next(new Error("Invalid refresh token, please log in again", 401));
    }
    return next();
  });

  io.on("connection", (socket) => onConnection(socket, io));
};

module.exports = createIoApp;
