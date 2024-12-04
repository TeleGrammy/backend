module.exports = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true, // If you need to share cookies with client
  },
  pingInterval: 25000, // Interval (ms) for heartbeats to check connection status
  pingTimeout: 20000, // Time (ms) to wait for client response before disconnecting
  reconnection: true, // Allows reconnections
  reconnectionAttempts: 10, // Number of attempts before failing reconnection
  reconnectionDelay: 2000, // Delay (ms) between reconnection attempts
  allowEIO3: true, // For compatibility with older clients if needed
};

