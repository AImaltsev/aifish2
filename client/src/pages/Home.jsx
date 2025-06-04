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

  // Обработка формы прогноза клёва
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleForecast = async e => {
    e.preventDefault();
    setForecast(null);
    setForecastError("");
    try {
      let lat, lon;
      if (coords.lat && coords.lon) {
        lat = coords.lat;
        lon = coords.lon;
      } else if (form.location) {
        // Получаем координаты по городу/локации
        const geo = await axios.get("http://localhost:4000/api/geocode?city=" + encodeURIComponent(form.location));
        lat = geo.data.lat;
        lon = geo.data.lon;
      } else {
        setForecastError("Укажите город или выберите точку на карте!");
        return;
      }
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/forecast",
        { species: form.species, lat, lon, date: form.date, timeOfDay: form.timeOfDay },
        { headers: { Authorization: "Bearer " + token } }
      );
      setForecast(res.data);
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
      {forecast && (
        <div style={{
          border: `2px solid ${getLevelColor(forecast.level)}`,
          background: "#fafdff",
          marginBottom: 20,
          padding: 14,
          borderRadius: 10
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4
          }}>
            <span style={{
              width: 16, height: 16,
              borderRadius: "50%",
              display: "inline-block",
              background: getLevelColor(forecast.level),
              marginRight: 8
            }}></span>
            <b>Клёв: {forecast.level?.toUpperCase() || "?"}</b>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
            {forecast.explanation}
          </pre>
        </div>
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
