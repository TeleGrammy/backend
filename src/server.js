const mongoose = require("mongoose");

const app = require("./app");

mongoose
  .connect(process.env.DB_HOST)
  .then(() => {
    console.log("Database Connection successed");
    app.listen(
      process.env.PORT || 3000,
      process.env.HOST_NAME || "localhost",
      () => {
        console.log(
          `Server is running on http://${process.env.HOST_NAME}:${process.env.PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(error);
  });
