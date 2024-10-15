const app = require("./app");

app.listen(process.env.PORT || 8000, process.env.HOSTNAME || "localhost");
