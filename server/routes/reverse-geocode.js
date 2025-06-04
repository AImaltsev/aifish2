// server/routes/reverse-geocode.js
const axios = require('axios');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat/lon required" });

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'AI-Fishing/1.0' } });

    let place = null;
    const a = data.address || {};

    // 1. Название реки/водоёма, если попали по воде
    if (a.water) place = a.water;
    else if (a.river) place = a.river;
    else if (a.reservoir) place = a.reservoir;
    else if (a.lake) place = a.lake;
    else if (a.stream) place = a.stream;

    // 2. fallback на населённый пункт
    else if (a.city) place = a.city;
    else if (a.town) place = a.town;
    else if (a.village) place = a.village;
    else if (a.hamlet) place = a.hamlet;
    else if (a.municipality) place = a.municipality;
    else if (a.state) place = a.state;

    // 3. display_name как fallback (реже, если совсем ничего)
    else if (data.display_name) place = data.display_name;

    // Добавляем регион (если нашли водоём + есть город/область)
    if (
      place &&
      (a.water || a.river || a.reservoir || a.lake || a.stream) &&
      (a.city || a.town || a.village || a.state)
    ) {
      if (a.city) place += `, ${a.city}`;
      else if (a.town) place += `, ${a.town}`;
      else if (a.village) place += `, ${a.village}`;
      else if (a.state && place !== a.state) place += `, ${a.state}`;
    }

    // <--- вот здесь главное: верните в ответ ещё и data.raw:
    res.json({ place: place || "Не найдено", raw: data });
  } catch (e) {
    res.status(500).json({ error: "Ошибка reverse-geocode", detail: e.message });
  }
});

module.exports = router;
