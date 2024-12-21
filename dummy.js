const bcrypt = require("bcrypt");

const hashedPassword =
  "$2b$12$2ZaNB3fZO2drZgIWak3ZB.6Ed5xc13L.HCtcnb3.krrzhVEnlIYWi";
const plainTextPassword = "google_user"; // Replace with the password you want to check

bcrypt.compare(plainTextPassword, hashedPassword, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    if (result) {
      console.log("Password matches!");
    } else {
      console.log("Password does not match.");
    }
  }
});
