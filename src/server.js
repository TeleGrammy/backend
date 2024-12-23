const fs = require("fs");
const mongoose = require("mongoose");
// const {createServer} = require("node:http");
const http = require("http");
const app = require("./expressApp");
const firebaseMessaging = require("./utils/firebaseMessaging");

// Determine if we are in production or development
let server;

if (process.env.NODE_ENV === "production") {
  // Production: Use HTTPS
  const options = {
    key: fs.readFileSync("/etc/ssl/certs/tls.key"),
    cert: fs.readFileSync("/etc/ssl/certs/tls.crt"),
  };
  server = https.createServer(options, app);
  console.log(":lock: HTTPS enabled for production");
} else {
  // Development: Use HTTP
  server = http.createServer(app);
  console.log(":tools: HTTP enabled for development");
}

// Initiallize the socket server to be compatible with the HTTP/HTTPS initialized servers
require("./ioApp")(server);

mongoose
  .connect(process.env.DB_HOST)
  .then(() => {
    console.log("Database Connection succeeded");
    server.listen(
      process.env.PORT || 3000,
      process.env.HOST_NAME || "localhost",
      () => {
        firebaseMessaging.initializeFirebase();
        console.log(
          `Server is running on http://${process.env.HOST_NAME || "localhost"}:${process.env.PORT || 3000}`
        );
      }
    );
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

module.exports = server;
