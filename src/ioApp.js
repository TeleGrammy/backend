const {Server} = require("socket.io");
const socketConfig = require("./config/socketConfig");
const {onConnection} = require("./eventHandlers/connection");

const createIoApp = (httpServer) => {
  const io = new Server(httpServer, socketConfig);
  module.exports.io = io;

  io.on("connection", (socket) => onConnection(socket, io));
};

module.exports = createIoApp;
