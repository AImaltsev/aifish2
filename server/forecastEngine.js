const { getWeatherForecast, getLocalMoonPhase } = require("./weather");
const fs = require("fs");
const path = require("path");

// Загрузить базу знаний (по видам рыб)
function getFishKnowledge() {
  const filePath = path.join(__dirname, 'data/fish_knowledge.json');
  if (!fs.existsSync(filePath)) return {};
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function getSeasonByMonth(month) {
  if ([12, 1, 2].includes(month)) return "зима";
  if ([3, 4, 5].includes(month)) return "весна";
  if ([6, 7, 8].includes(month)) return "лето";
  return "осень";
}

// Анализ прогноза по правилам из fish_knowledge
function analyzeMatch({ fish, weather, moonPhase, date }) {
  const fishKnowledge = getFishKnowledge();
  const knowledgeArr = fishKnowledge[fish.toLowerCase()];
  if (!knowledgeArr || knowledgeArr.length === 0) {
    return { score: 0, level: "нет данных", reason: "Нет данных по этой рыбе." };
  }
  const rules = knowledgeArr[0]; // используем первую карточку (от Сабанеева)

  let score = 0;
  let reasons = [];

  // 1. Сезон
  const month = new Date(date).getMonth() + 1;
  const nowSeason = getSeasonByMonth(month);
  if (rules.season && rules.season.includes(nowSeason)) {
    score += 0.25; reasons.push("подходящий сезон (" + nowSeason + ")");
  } else {
    reasons.push("неудачный сезон");
  }

  // 2. Температура (берём макс. или среднюю за день)
  const t = weather.daily?.temperature_2m_max?.[0];
  if (t && rules.tempRange && rules.tempRange.length === 2) {
    if (t >= rules.tempRange[0] && t <= rules.tempRange[1]) {
      score += 0.25; reasons.push("температура воды/воздуха в норме (" + t + "°C)");
    } else {
      reasons.push("температура неидеальна (" + t + "°C)");
    }
  }

  // 3. Ветер (берём доминантное направление)
  const windDir = weather.daily?.winddirection_10m_dominant?.[0];
  let windOk = false;
  if (windDir) {
    // Юг ~180, запад ~270
    if (
      (windDir >= 157 && windDir <= 202 && rules.weatherGood.join(" ").includes("южн")) ||
      (windDir >= 247 && windDir <= 292 && rules.weatherGood.join(" ").includes("запад"))
    ) {
      score += 0.25; windOk = true; reasons.push("ветер хороший");
    }
    if (
      (windDir >= 337 || windDir <= 22) && rules.weatherBad.join(" ").includes("север")
    ) {
      reasons.push("северный ветер (обычно плохо)");
    }
  }

  // 4. Фаза луны — если есть “полнолуние”, "новолуние", "убывающая", можно доработать
  if (rules.weatherGood.join(" ").includes(moonPhase)) {
    score += 0.15; reasons.push("удачная лунная фаза");
  } else {
    reasons.push("средняя лунная фаза");
  }

  // Итоговый уровень
  let level = "слабый";
  if (score >= 0.7) level = "отличный";
  else if (score >= 0.4) level = "средний";

  return {
    score: Math.round(score * 100) / 100,
    level,
    reason: reasons.join(", ")
  };
}

// Главная функция: прогноз клёва
async function getBiteForecast({ species, lat, lon, date }) {
  const weather = await getWeatherForecast(lat, lon);
  const moonPhase = getLocalMoonPhase(date ? new Date(date) : new Date());
  const result = analyzeMatch({
    fish: species,
    weather,
    moonPhase,
    date
  });
  return {
    ...result,
    moonPhase,
    weather: weather.daily,
  };
}

module.exports = { getBiteForecast };
