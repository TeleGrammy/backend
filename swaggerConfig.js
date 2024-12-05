const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
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
        url: `http://${process.env.HOST_NAME}:${process.env.PORT}/api/v1`,
        description: "Local server",
      },
    ],
  },
  apis: ["./src/docs/*.js"],
};
const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
