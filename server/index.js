require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const fishingRoutes = require("./routes/fishing");
const forecastRoutes = require("./routes/forecast");
const fs = require('fs');
const path = require('path');
const { getWeatherForecast, getLocalMoonPhase, geocodeCity, reverseGeocode } = require('./weather');
const reverseGeocodeRoutes = require("./routes/reverse-geocode");
const fishAdminRouter = require('./routes/fishAdmin');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.use("/api", authRoutes);
app.use("/api/fishing", fishingRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/reverse-geocode", reverseGeocodeRoutes);
app.use('/api/fish-admin', fishAdminRouter);

app.get("/", (req, res) => {
  res.send("AI-Fishing API works!");
});

// Получить карточку знаний по виду рыбы
app.get('/api/knowledge/:species', (req, res) => {
  const fishData = getFishKnowledge();
  const species = req.params.species.toLowerCase();
  if (fishData[species]) {
    res.json(fishData[species]);
  } else {
    res.status(404).json({ error: 'Нет данных по этому виду рыбы' });
  }
});

// Прогноз погоды по координатам
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });

  try {
    const weather = await getWeatherForecast(lat, lon);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка запроса погоды', detail: err.message });
  }
});

// Получение фазы луны и астрономических данных
app.get('/api/moon', (req, res) => {
  // Можно добавить параметр даты (YYYY-MM-DD)
  const { date } = req.query;
  let targetDate = date ? new Date(date) : new Date();
  const phase = getLocalMoonPhase(targetDate);
  res.json({ phase });
});

// Получить координаты по названию города
app.get('/api/geocode', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city required' });

  try {
    const { lat, lon } = await geocodeCity(city);
    res.json({ lat, lon });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка геокодера', detail: err.message });
  }
});

// Получить список всех видов рыб из базы знаний
app.get('/api/species', (req, res) => {
  const fishData = getFishKnowledge();
  // Вернуть массив ключей (названия видов рыб)
  res.json(Object.keys(fishData));
});

app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });
  try {
    const city = await reverseGeocode(lat, lon);
    res.json({ city });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка reverse-geocode', detail: err.message });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Функция для получения базы знаний из JSON
function getFishKnowledge() {
  const filePath = path.join(__dirname, 'data/fish_knowledge.json');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}
