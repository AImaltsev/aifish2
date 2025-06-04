import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [fishings, setFishings] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [form, setForm] = useState({
    location: "",
    date: "",
    fishSpecies: ""
  });
  const [forecastError, setForecastError] = useState("");
  const navigate = useNavigate();

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

  // Форма прогноза
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleForecast = async e => {
    e.preventDefault();
    setForecast(null);
    setForecastError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:4000/api/forecast", {
        ...form,
        fishSpecies: form.fishSpecies.split(",").map(s => s.trim())
      }, {
        headers: { Authorization: "Bearer " + token }
      });
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
        <input name="location" value={form.location} onChange={handleChange} placeholder="Место" style={{ marginRight: 10 }} />
        <input name="date" type="date" value={form.date} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="fishSpecies" value={form.fishSpecies} onChange={handleChange} placeholder="Виды рыбы (через запятую)" style={{ marginRight: 10 }} />
        <button type="submit">Показать прогноз</button>
      </form>
      {forecast && (
        <div style={{ border: "1px solid #51d88a", background: "#e6fff3", marginBottom: 20, padding: 12, borderRadius: 8 }}>
          <b>Прогноз клёва: {forecast.score}</b><br />
          <i>{forecast.reason}</i><br />
          <b>Совет:</b> {forecast.advice}
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
