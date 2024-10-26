const mongoose = require("mongoose");
const {seeds} = require("./src/utils/seeds");
const app = require("./app");

mongoose
  .connect(process.env.DB_HOST)
  .then(() => {
    console.log("Database Connection successed");
    app.listen(process.env.PORT, process.env.HOSTNAME, () => {
      console.log(
        `Server is running on http://${process.env.HOSTNAME}:${process.env.PORT}`
      );
    });
    // uncomment the following line to run the database seeds
    // seeds();
  })
  .catch((error) => {
    console.error(error);
  });
