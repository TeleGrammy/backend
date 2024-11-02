const {Server} = require("socket.io");
const onConnection = require("./eventHandlers/connection");

const createIoApp = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", onConnection);
};

module.exports = createIoApp;
