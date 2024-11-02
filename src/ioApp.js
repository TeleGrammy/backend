const {Server} = require("socket.io");

const createIoApp = (httpServer) => {
  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("User connected" + socket.id);
  });
};

module.exports = createIoApp;
