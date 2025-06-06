const { getBiteForecast } = require("../forecastEngine");

// Принимает запрос, вызывает анализатор и возвращает прогноз
const getForecast = async (req, res) => {
  try {
    const { species, lat, lon, date } = req.body;
    if (!species || !lat || !lon) {
      return res.status(400).json({ error: "Не хватает данных (species, lat, lon)" });
    }
    const forecast = await getBiteForecast({ species, lat, lon, date });
    res.json(forecast);
  } catch (e) {
    res.status(500).json({ error: "Ошибка анализа прогноза", detail: e.message });
  }
};

module.exports = { getForecast };
