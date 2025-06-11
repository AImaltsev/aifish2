const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBiteForecast } = require('../forecastEngine');
const { generateText } = require('../utils/sbergpt');


// Единый POST эндпоинт
router.post("/", authMiddleware, async (req, res) => {
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

router.post("/live-forecast", async (req, res) => {
  try {
    const { facts, place, date, weather } = req.body;
    const prompt = `Сформулируй живое объяснение прогноза клёва для рыболова по этим данным: ${facts}. Место: ${place}, дата: ${date}, погода: ${weather}. Пиши как рыболовный эксперт.`;

    const result = await generateText(prompt);
    res.json({ text: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка генерации объяснения" });
  }
});

module.exports = router;
