import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker"; // путь корректируй под проект

function getLevelColor(level) {
  if (level === "отличный") return "#51d88a";
  if (level === "средний") return "#ffc107";
  if (level === "слабый") return "#ff5f5f";
  return "#aab";
}

export default function Home() {
  const [fishings, setFishings] = useState([]);
  const [fishList, setFishList] = useState([]);
  const [form, setForm] = useState({
    location: "",
    date: new Date().toISOString().slice(0, 10),
    species: "",
    timeOfDay: "утро"
  });
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [forecast, setForecast] = useState(null);
  const [forecastError, setForecastError] = useState("");
  const [forecastGpt, setForecastGpt] = useState(""); // Новое состояние
  const [forecastGptLoading, setForecastGptLoading] = useState(false);
  const [forecastGptError, setForecastGptError] = useState("");
  const navigate = useNavigate();

  // Получаем список рыб с сервера
  useEffect(() => {
    axios.get("http://localhost:4000/api/species")
      .then(res => {
        setFishList(res.data);
        setForm(f => ({ ...f, species: res.data[0] || "" }));
      })
      .catch(() => setFishList([]));
  }, []);

  // Загрузка всех рыбалок пользователя
  useEffect(() => {
    const fetchFishings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/fishing", {
          headers: { Authorization: "Bearer " + token }
        });
        setFishings(res.data);
      } catch (e) {
        setFishings([]);
      }
    };
    fetchFishings();
  }, []);

  // Автоматически определяем место по координатам (река, озеро, город, ...).
  useEffect(() => {
    async function fetchPlace() {
      if (coords.lat && coords.lon) {
        try {
          const res = await axios.get(
            `http://localhost:4000/api/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`
          );
          const a = res.data.raw?.address || {};
          const water =
            a.water || a.river || a.lake || a.reservoir || a.stream;
          if (water) {
            let place = water;
            if (a.city) place += `, ${a.city}`;
            else if (a.town) place += `, ${a.town}`;
            else if (a.state) place += `, ${a.state}`;
            setForm(f => ({ ...f, location: place }));
          } else if (res.data.place) {
            setForm(f => ({ ...f, location: res.data.place }));
          }
        } catch (e) {
          // Не удалось получить место — оставляем как есть
        }
      }
    }
    fetchPlace();
  }, [coords.lat, coords.lon]);

  // Обработка формы прогноза клёва
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleForecast = async e => {
    e.preventDefault();
    setForecast(null);
    setForecastGpt("");
    setForecastError("");
    setForecastGptError("");
    try {
      let lat, lon;
      if (coords.lat && coords.lon) {
        lat = coords.lat;
        lon = coords.lon;
      } else if (form.location) {
        const geo = await axios.get("http://localhost:4000/api/geocode?city=" + encodeURIComponent(form.location));
        lat = geo.data.lat;
        lon = geo.data.lon;
      } else {
        setForecastError("Укажите город или выберите точку на карте!");
        return;
      }
      const token = localStorage.getItem("token");
      // 1. Получаем обычный прогноз
      const res = await axios.post(
        "http://localhost:4000/api/forecast",
        { species: form.species, lat, lon, date: form.date, timeOfDay: form.timeOfDay },
        { headers: { Authorization: "Bearer " + token } }
      );
      setForecast(res.data);
      // 2. Получаем "живое объяснение" от GPT (Сбер)
      setForecastGptLoading(true);
      try {
        const gptRes = await axios.post(
          "http://localhost:4000/api/forecast/live-forecast",
          {
            facts: res.data.details?.map(d => d.explanation).join("; ") || "",
            place: form.location,
            date: form.date,
            weather: res.data.weather || "",
          },
          { headers: { Authorization: "Bearer " + token } }
        );
        setForecastGpt(gptRes.data.text);
      } catch (gptErr) {
        setForecastGptError(gptErr.response?.data?.error || "Ошибка генерации объяснения");
      } finally {
        setForecastGptLoading(false);
      }
    } catch (e) {
      setForecastError(e.response?.data?.error || "Ошибка получения прогноза");
    }
  };

  // Сбросить выбор точки на карте
  const resetCoords = () => setCoords({ lat: null, lon: null });

  return (
    <div>
      <h1>Главная — AI-Fishing</h1>
      <form onSubmit={handleForecast} style={{ marginBottom: 20, border: "1px solid #ccc", padding: 10, borderRadius: 8 }}>
        <h3>Получить прогноз клёва</h3>
        <div style={{ marginBottom: 8 }}>
          <label>Где ловить:&nbsp;
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Введите город или выберите точку на карте"
              style={{ marginRight: 10 }}
              disabled={coords.lat && coords.lon}
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Или выберите точку на карте:</b>
          <MapPicker
            lat={coords.lat || 53.15538}
            lon={coords.lon || 48.47412}
            onChange={setCoords}
          />
          <button
            type="button"
            onClick={async () => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  pos => {
                    setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                  },
                  err => {
                    alert("Не удалось получить геолокацию");
                  }
                );
              } else {
                alert("Геолокация не поддерживается вашим браузером");
              }
            }}
            style={{
              margin: "8px 0",
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #bbb",
              background: "#f2f8ff",
              color: "#2563eb",
              cursor: "pointer"
            }}
          >
            📍 Моё местоположение
          </button>

          {coords.lat && coords.lon && (
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              Координаты: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              &nbsp;
              <button
                type="button"
                style={{
                  background: "#eee",
                  border: "none",
                  color: "#333",
                  marginLeft: 8,
                  padding: "2px 6px",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
                onClick={resetCoords}
              >
                × Сбросить точку
              </button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Дата:&nbsp;
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              style={{ marginRight: 10 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Вид рыбы:&nbsp;
            <select
              name="species"
              value={form.species}
              onChange={handleChange}
              required
              style={{ marginRight: 10 }}
            >
              {fishList.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Время суток:&nbsp;
            <select
              name="timeOfDay"
              value={form.timeOfDay}
              onChange={handleChange}
              style={{ marginRight: 10 }}
            >
              <option value="утро">Утро</option>
              <option value="день">День</option>
              <option value="вечер">Вечер</option>
              <option value="ночь">Ночь</option>
            </select>
          </label>
        </div>
        <button type="submit">Показать прогноз</button>
      </form>
      {/* Предупреждение, если точка не на Волге */}
      {forecast && forecast.onVolga === false && (
        <div style={{
          background: "#ffe69c",
          color: "#775e00",
          padding: "12px 18px",
          borderRadius: 10,
          marginBottom: 15,
          fontWeight: 500,
          border: "1.5px solid #ffc107",
          boxShadow: "0 2px 10px rgba(255,200,70,0.09)"
        }}>
          ⚠️ <b>Внимание!</b> Сейчас наш сервис максимально адаптирован для прогноза на реке <b>Волга</b>.<br />
          Прогноз для выбранного участка строится по тем же алгоритмам, но его точность может быть ниже.<br />
          Сервис постоянно развивается. Следите за новостями, скоро у нас будут все водоёмы<br />
          <span style={{ fontSize: 14, color: '#a08800' }}>Для максимальной точности советуем указывать точки непосредственно на Волге.</span>
        </div>
      )}
      {forecast && (
        <div
          style={{
            border: `2px solid ${getLevelColor(
              forecast.stats && forecast.stats.excellent > 0
                ? "отличный"
                : forecast.stats && forecast.stats.medium > 0
                  ? "средний"
                  : "слабый"
            )
              }`,
            background: "#fafdff",
            marginBottom: 20,
            padding: 14,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "inline-block",
                background:
                  getLevelColor(
                    forecast.stats && forecast.stats.excellent > 0
                      ? "отличный"
                      : forecast.stats && forecast.stats.medium > 0
                        ? "средний"
                        : "слабый"
                  ),
                marginRight: 8,
              }}
            ></span>
            <b>
              Клёв: {forecast.verdict?.toUpperCase() || "?"}
            </b>
          </div>
          <div style={{ marginBottom: 10, color: "#697", fontSize: 15 }}>
            {forecast.moonPhase && <>Фаза луны: <b>{forecast.moonPhase}</b><br /></>}
            {forecast.date && <>Дата прогноза: {forecast.date}<br /></>}
          </div>
          {/* Детализация по источникам */}
          {forecast.details && forecast.details.length > 0 && (
            <div>
              <b>Анализ по источникам:</b>
              <ul style={{ margin: "8px 0 0 18px" }}>
                {forecast.details.map((d, i) => (
                  <li key={i} style={{ marginBottom: 7 }}>
                    <b>{d.source}:</b>{" "}
                    <span style={{ color: getLevelColor(d.level), fontWeight: 500 }}>
                      {d.level}
                    </span>
                    <br />
                    <span style={{ fontSize: 15, whiteSpace: "pre-wrap" }}>
                      {d.explanation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Новый блок: GPT-объяснение для рыбака */}
      {forecastGptLoading && (
        <div style={{
          padding: 14, background: "#f2f8ff", borderRadius: 10, marginBottom: 12, color: "#2563eb"
        }}>Генерируем совет от ИИ…</div>
      )}
      {forecastGpt && (
        <div style={{
          border: "2px dashed #51d88a",
          background: "#f6fff8",
          marginBottom: 20,
          padding: 14,
          borderRadius: 10,
          fontSize: 17,
          lineHeight: 1.5
        }}>
          <b>Совет AI-рыболова:</b>
          <div style={{ marginTop: 8, whiteSpace: "pre-line" }}>{forecastGpt}</div>
        </div>
      )}
      {forecastGptError && (
        <div style={{ color: "red", marginBottom: 10 }}>{forecastGptError}</div>
      )}
      {forecastError && <div style={{ color: "red", marginBottom: 20 }}>{forecastError}</div>}

      <button onClick={() => navigate("/add")}>Добавить рыбалку</button>
      <h2>Мои рыбалки:</h2>
      {fishings.length === 0 && <p>Нет рыбалок. Добавьте первую!</p>}
      <ul>
        {fishings.map(f => (
          <li key={f.id}>
            <b>{f.location}</b> — {new Date(f.date).toLocaleDateString()} — {f.fishSpecies?.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
