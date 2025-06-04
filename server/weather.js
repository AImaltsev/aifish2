const axios = require('axios');
const lune = require('lune');

// Получить прогноз погоды по координатам
async function getWeatherForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,cloudcover,windspeed_10m,winddirection_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,uv_index_max&forecast_days=3&timezone=Europe/Moscow`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error('Open-Meteo error:', err.response?.data || err.message);
    throw err;
  }
}

// Получить фазу луны по дате (локализовано на русский)
function getLocalMoonPhase(date = new Date()) {
  const phase = lune.phase(date).phase; // число от 0 до 1
  // Маппим в человекочитаемое название
  if (phase < 0.03 || phase > 0.97) return "Новолуние";
  if (phase < 0.22) return "Молодая Луна (растущая)";
  if (phase < 0.28) return "Первая четверть";
  if (phase < 0.47) return "Растущая Луна";
  if (phase < 0.53) return "Полнолуние";
  if (phase < 0.72) return "Убывающая Луна";
  if (phase < 0.78) return "Последняя четверть";
  return "Старая Луна (убывающая)";
}

// Получить координаты города через Nominatim (OpenStreetMap)
async function geocodeCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&country=Россия&format=json`;
  const response = await axios.get(url, { headers: { 'User-Agent': 'AI-Fishing/1.0' } });
  if (response.data.length === 0) throw new Error('Город не найден');
  return { lat: response.data[0].lat, lon: response.data[0].lon };
}

// Получить город по координатам (reverse geocoding)
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const response = await axios.get(url, { headers: { 'User-Agent': 'AI-Fishing/1.0' } });
  // Возвращаем city, town, village или display_name
  return (
    response.data.address.city ||
    response.data.address.town ||
    response.data.address.village ||
    response.data.address.settlement ||
    response.data.display_name ||
    ""
  );
}

module.exports = {
  getWeatherForecast,
  getLocalMoonPhase,
  geocodeCity,
  reverseGeocode
};
