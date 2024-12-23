const {Server} = require("socket.io");
const {createClient} = require("redis");
const {createAdapter} = require("@socket.io/redis-adapter");
const {onConnection} = require("./eventHandlers/connection");
const groupConnection = require("./eventHandlers/groupNameSpace");
const channelConnection = require("./eventHandlers/channelNameSpace");
const isAuth = require("./middlewares/isAuthenticatedSocket");

const publsier = createClient({url: process.env.REDIS_URL});
publsier.on("error", (err) => {
  console.error("Redis error:", err);
});
const subscriber = publsier.duplicate();

const connectPublsierAndSubscriber = async () => {
  await Promise.all([publsier.connect(), subscriber.connect()]);
};
connectPublsierAndSubscriber();

const createIoApp = (httpServer) => {
  console.log("Setup Socket.IO");
  const io = new Server(httpServer, {
    adapter: createAdapter(publsier, subscriber),
    cors: {
      origin: "*", // Allow any origin for testing. Restrict this in production.
    },
  });
  const connectedUsers = new Map();
  module.exports.ioServer = io;

  io.use(isAuth);

  io.on("connection", (socket) => onConnection(socket, io, connectedUsers));
  io.on("connection", (socket) => groupConnection(socket, io, connectedUsers));
  io.on("connection", (socket) =>
    channelConnection(socket, io, connectedUsers)
  );
};

module.exports.createIoApp = createIoApp;
