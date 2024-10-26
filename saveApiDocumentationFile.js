const fs = require("fs");
const {specs} = require("./swaggerConfig");

fs.writeFileSync("./swagger-output.json", JSON.stringify(specs, null, 2));
