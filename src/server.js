const fs = require("fs");
const mongoose = require("mongoose");
const http = require("http");
const https = require("https");
const app = require("./expressApp");
const firebaseMessaging = require("./utils/firebaseMessaging");

let server;

if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("/etc/ssl/certs/tls.key"),
    cert: fs.readFileSync("/etc/ssl/certs/tls.crt"),
  };
  server = https.createServer(options, app);
  console.log(":lock: HTTPS enabled for production");
} else {
  server = http.createServer(app);
  console.log(":tools: HTTP enabled for development");
}

require("./ioApp").createIoApp(server);

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
