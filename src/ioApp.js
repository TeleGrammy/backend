const {Server} = require("socket.io");
const socketConfig = require("./config/socketConfig");
const {onConnection} = require("./eventHandlers/connection");

const createIoApp = (httpServer) => {
  const io = new Server(httpServer, socketConfig);
  io.on("connection", onConnection);
};

module.exports = createIoApp;
