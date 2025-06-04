// Простейшая заглушка — прогноз по дню недели, для примера
const getForecast = (req, res) => {
  const { location, date, fishSpecies } = req.body;

  const dateObj = new Date(date);
  const weekday = dateObj.getDay();

  // Примитивная логика "заглушка"
  let score = "normal";
  let reason = "Средние условия";
  let advice = "Используйте универсальные снасти";

  if ([0, 6].includes(weekday)) {
    score = "good";
    reason = "Выходные дни, клёв традиционно лучше!";
    advice = "Рекомендуем фидер или спиннинг";
  }
  if (fishSpecies && fishSpecies.includes("щука")) {
    advice += ". Для щуки попробуйте крупные блёсны";
  }

  res.json({
    score,
    reason,
    advice,
    location,
    date,
    fishSpecies
  });
};

module.exports = { getForecast };
