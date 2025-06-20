const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBiteForecast } = require('../forecastEngine');
const { askGigaChat } = require('../utils/gigachat');
const { isPointOnVolga } = require('../utils/isVolga'); // Импортируем функцию

// Единый POST эндпоинт
router.post("/", authMiddleware, async (req, res) => {
  const { species, lat, lon, date } = req.body;
  if (!species || !lat || !lon) {
    return res.status(400).json({ error: "species, lat, lon required" });
  }
  try {
    // Проверяем: точка на Волге?
    const onVolga = isPointOnVolga(lat, lon);

    const forecast = await getBiteForecast({ species, lat, lon, date });

    // Добавляем признак onVolga в ответ для фронта
    res.json({
      ...forecast,
      onVolga,
    });
  } catch (err) {
    console.error("Ошибка при формировании прогноза:", err);
    res.status(500).json({ error: "Ошибка прогноза клёва", detail: err.message });
  }
});

// Генерация живого объяснения (AI)
router.post("/live-forecast", async (req, res) => {
  try {
    const { place, date, weather, facts, species } = req.body;
    const prompt = `
Сформулируй живое экспертное объяснение прогноза клёва для рыболова по этим данным: ${facts}.
Место: ${place}, дата: ${date}, погода: ${weather}.
Рыба: ${species}.
Обязательно опиши наиболее эффективные снасти, приманки и методы для ловли именно этой рыбы — ${species}.
Не упоминай универсальные снасти для других видов. Не предлагай фидер и донку для судака.
Пиши кратко и как опытный рыболов-эксперт, избегай общих фраз.
`;
    const result = await askGigaChat(prompt);
    res.json({ text: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка генерации объяснения" });
  }
});

module.exports = router;
