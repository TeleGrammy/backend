const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
require("dotenv").config({
  path: ".env",
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TeleGrammy API Documentation",
      version: "1.0.0",
      description: "API documentation for the TeleGrammy Application",
    },
    servers: [
      {
        url: `http://${process.env.HOSTNAME}:${process.env.PORT}`,
        description: "Local server",
      },
    ],
  },
  apis: ["./src/docs/*.js", "./src/routes/*.js"],
};
const specs = swaggerJsdoc(options);
fs.writeFileSync("./swagger-output.json", JSON.stringify(specs, null, 2));

module.exports = {
  swaggerUi,
  specs,
};
