const express = require("express");
const {globalSearch} = require("../controllers/globalSearchController");

const router = express.Router();

router.route("/global-search").get(globalSearch);

module.exports = router;
