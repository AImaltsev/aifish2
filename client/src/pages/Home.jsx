import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [fishings, setFishings] = useState([]);
  const [fishList, setFishList] = useState([]);
  const [form, setForm] = useState({
    city: "",
    date: new Date().toISOString().slice(0, 10),
    species: ""
  });
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
      // Получаем координаты по городу
      const geo = await axios.get("http://localhost:4000/api/geocode?city=" + encodeURIComponent(form.city));
      const { lat, lon } = geo.data;
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/forecast",
        { species: form.species, lat, lon, date: form.date },
        { headers: { Authorization: "Bearer " + token } }
      );
      setForecast(res.data);
    } catch (e) {
      setForecastError(e.response?.data?.error || "Ошибка получения прогноза");
    }
  };

  return (
    <div>
      <h1>Главная — AI-Fishing</h1>
      <form onSubmit={handleForecast} style={{ marginBottom: 20, border: "1px solid #ccc", padding: 10, borderRadius: 8 }}>
        <h3>Получить прогноз клёва</h3>
        <div style={{ marginBottom: 8 }}>
          <label>Город:&nbsp;
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Например, Сызрань"
              required
              style={{ marginRight: 10 }}
            />
          </label>
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
        <button type="submit">Показать прогноз</button>
      </form>
      {forecast && (
        <div>
          <b>Прогноз клёва: {forecast.score}</b><br />
          <pre style={{ whiteSpace: "pre-wrap" }}>{forecast.explanation}</pre>
          {/* Можно по-прежнему отдельно показать луну и дату */}
          {/* <div>Фаза луны: {forecast.moonPhase}</div>
    <div>Дата: {forecast.date}</div> */}
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
