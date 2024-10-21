const mongoose = require("mongoose");

const app = require("./app");

mongoose
  .connect(process.env.DB_HOST)
  .then(() => {
    console.log("Database Connection successed");
    console.log(process.env.HOSTNAME);
    app.listen(
      process.env.PORT || 3000,
      process.env.HOSTNAME || "localhost",
      () => {
        console.log(
          `Server is running on http://${process.env.HOSTNAME}:${process.env.PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(error);
  });
