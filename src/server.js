const mongoose = require("mongoose");
const {createServer} = require("node:http");
const app = require("./expressApp");

const httpServer = createServer(app); // app is passed here
require("./ioApp")(httpServer);

mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection succeeded");
    httpServer.listen(
      process.env.PORT || 3000,
      process.env.HOST_NAME || "localhost",
      () => {
        console.log(
          `Server is running on http://${process.env.HOST_NAME || "localhost"}:${process.env.PORT || 3000}`
        );
      }
    );
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

module.exports = httpServer;
