const express = require("express");
const router = express.Router();
const forecastController = require("../controllers/forecastController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, forecastController.getForecast);

module.exports = router;
