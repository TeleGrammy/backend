const express = require("express");

const authenticationController = require("../controllers/authenticationController");

const router = express.Router();

router.post("/forget-password", authenticationController.forgetPassword);

module.exports = router;
