const {Server} = require("socket.io");
const {onConnection} = require("./eventHandlers/connection");
const groupConnection = require("./eventHandlers/groupNameSpace");
const isAuth = require("./middlewares/isAuthenticatedSocket");

const createIoApp = (httpServer) => {
  console.log("Setup Socket.IO");
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow any origin for testing. Restrict this in production.
    },
  });
  const connectedUsers = new Map();
  const groupIO = io.of("/group/");
  io.use(isAuth);
  groupIO.use(isAuth);

  io.on("connection", (socket) => onConnection(socket, io, connectedUsers));
  groupIO.on("connection", (socket) =>
    groupConnection(socket, groupIO, connectedUsers)
  );
};

module.exports = createIoApp;
