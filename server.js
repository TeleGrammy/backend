const app = require("./app");

app.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(
    `Server is running on http://${process.env.HOSTNAME}:${process.env.PORT}`,
  );
});
