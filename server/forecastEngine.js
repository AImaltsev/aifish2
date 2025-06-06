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

// Генерация красивого объяснения
function makeExplanation({ level, reasons, species, city, t, nowSeason, moonPhase, date, advice, source }) {
  let title = "";
  if (level === "отличный") title = `Сегодня отличный клёв для ${species}${city ? ' в ' + city : ''}!`;
  else if (level === "средний") title = `Клёв для ${species}${city ? ' в ' + city : ''} возможен, но есть нюансы.`;
  else if (level === "нет данных") title = `Нет данных по виду "${species}".`;
  else title = `Клёв для ${species}${city ? ' в ' + city : ''} скорее всего слабый.`;

  let tips = "";
  if (advice) {
    tips = "Совет: " + advice;
  } else if (level === "отличный") {
    tips = "Советуем отправляться на водоём — все условия в вашу пользу!";
  } else if (level === "средний") {
    tips = "Лучше выбрать проверенные снасти и подходящее время суток.";
  } else {
    tips = "Лучше дождаться лучших условий.";
  }

  return `${title}\nИсточник: ${source || "не указан"}\n${reasons.join(", ")}.\n${tips}\nФаза луны: ${moonPhase}.\nДата: ${date}.`;
}

// Анализирует все карточки для данного вида рыбы
function analyzeAllSources({ fish, weather, moonPhase, date, city }) {
  const fishKnowledge = getFishKnowledge();
  const knowledgeArr = fishKnowledge[fish.toLowerCase()];
  if (!knowledgeArr || knowledgeArr.length === 0) {
    return [{
      score: 0,
      level: "нет данных",
      source: null,
      explanation: `Нет данных по виду "${fish}".`
    }];
  }
  return knowledgeArr.map(rules => {
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

    // 3. Ветер
    const windDir = weather.daily?.winddirection_10m_dominant?.[0];
    if (windDir) {
      if (
        (windDir >= 157 && windDir <= 202 && rules.weatherGood && rules.weatherGood.join(" ").includes("южн")) ||
        (windDir >= 247 && windDir <= 292 && rules.weatherGood && rules.weatherGood.join(" ").includes("запад"))
      ) {
        score += 0.25; reasons.push("ветер хороший");
      }
      if (
        (windDir >= 337 || windDir <= 22) && rules.weatherBad && rules.weatherBad.join(" ").includes("север")
      ) {
        reasons.push("северный ветер (обычно плохо)");
      }
    }

    // 4. Фаза луны
    if (rules.weatherGood && rules.weatherGood.join(" ").includes(moonPhase)) {
      score += 0.15; reasons.push("удачная лунная фаза");
    } else {
      reasons.push("средняя лунная фаза");
    }

    // Итоговый уровень
    let level = "слабый";
    if (score >= 0.7) level = "отличный";
    else if (score >= 0.4) level = "средний";

    // Совет
    let advice = "";
    if (rules.tackleAdvice && rules.tackleAdvice.length) {
      advice = rules.tackleAdvice[0];
    }

    return {
      score: Math.round(score * 100) / 100,
      level,
      source: rules.source || null,
      explanation: makeExplanation({
        level,
        reasons,
        species: fish,
        city,
        t,
        nowSeason,
        moonPhase,
        date,
        advice,
        source: rules.source || null,
      }),
    };
  });
}

// Главная функция: прогноз клёва с учетом всех источников
async function getBiteForecast({ species, lat, lon, date, city }) {
  const weather = await getWeatherForecast(lat, lon);
  const moonPhase = getLocalMoonPhase(date ? new Date(date) : new Date());
  const allResults = analyzeAllSources({
    fish: species,
    weather,
    moonPhase,
    date,
    city,
  });

  // Считаем статистику по уровням
  let excellent = 0, medium = 0, bad = 0;
  allResults.forEach(r => {
    if (r.level === "отличный") excellent++;
    else if (r.level === "средний") medium++;
    else if (r.level === "слабый") bad++;
  });

  // Итоговый вердикт
  let verdict = "Прогноз неоднозначный.";
  if (excellent > bad && excellent > medium) verdict = "Сегодня отличный клёв!";
  else if (bad > excellent && bad > medium) verdict = "Клёв будет слабым.";
  else if (medium > excellent && medium > bad) verdict = "Есть шансы, но условия не идеальны.";

  // Собираем все объяснения для фронта
  const details = allResults.map(r => ({
    source: r.source,
    level: r.level,
    explanation: r.explanation,
  }));

  return {
    verdict,
    stats: {
      excellent, medium, bad, total: allResults.length,
    },
    details,        // подробно по каждому источнику!
    moonPhase,
    date,
  };
}

module.exports = { getBiteForecast };
