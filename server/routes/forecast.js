const express = require("express");
const router = express.Router();
const forecastController = require("../controllers/forecastController");
const authMiddleware = require("../middleware/authMiddleware");
const { getBiteForecast } = require('../forecastEngine');

router.post("/", authMiddleware, forecastController.getForecast);

router.post("/", async (req, res) => {
  // На фронте ты отправляешь { species, lat, lon, date }
  const { species, lat, lon, date } = req.body;
  if (!species || !lat || !lon) {
    return res.status(400).json({ error: "species, lat, lon required" });
  }
  try {
    const forecast = await getBiteForecast({ species, lat, lon, date });
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: "Ошибка прогноза клёва", detail: err.message });
  }
});

module.exports = router;
