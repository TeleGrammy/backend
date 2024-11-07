const jwt = require("jsonwebtoken");
const {Server} = require("socket.io");
const socketConfig = require("./config/socketConfig");
const {onConnection} = require("./eventHandlers/connection");

const AppError = require("./errors/appError");

const fake =
  "eyJpZCI6IjY3MjI5N2Y1MGY2MzVkMTdkNTQ1MDk1YyIsIm5hbWUiOiJNb2hfRUxjIiwiZW1haWwiOiJtb2hhbWVkLmFidWVsbmdhMDNAZ21haWwuY29tIiwicGhvbmUiOiIrMjAxMDA2NTQwMTc1IiwibG9nZ2VkT3V0RnJvbUFsbERldmljZXNBdCI6bnVsbCwiaWF0IjoxNzMwOTI2MjIwLCJleHAiOjE3MzA5Mjk4MjAsImF1ZCI6Im15YXBwLXVzZXJzIiwiaXNzIjoibXlhcHAifQ";

const createIoApp = (httpServer) => {
  console.log("Setup Socket.IO")
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
      console.log(decodedAccessToken);
      socket.user = decodedAccessToken;
    } catch (error) {
      console.log(error);
      return socket.emit("error", "JWT Expire");
    }
    return next();
  });

  io.on("connection", (socket) => onConnection(socket, io));
};

module.exports = createIoApp;
