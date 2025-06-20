import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker"; // путь корректируйте при необходимости

import ForecastForm from "../components/home/ForecastForm";
import ForecastResult from "../components/home/ForecastResult";
import AIGptAdvice from "../components/home/AIGptAdvice";
import UserFishingList from "../components/home/UserFishingList";
import WarningBlock from "../components/home/WarningBlock";

export default function Home() {
  const [fishings, setFishings] = useState([]);
  const [fishList, setFishList] = useState([]);
  const [form, setForm] = useState({
    location: "",
    date: new Date().toISOString().slice(0, 10),
    species: "",
    timeOfDay: "утро",
    coords: { lat: null, lon: null },
  });
  const [forecast, setForecast] = useState(null);
  const [forecastError, setForecastError] = useState("");
  const [forecastGpt, setForecastGpt] = useState("");
  const [forecastGptLoading, setForecastGptLoading] = useState(false);
  const [forecastGptError, setForecastGptError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Получаем список рыб с сервера
  useEffect(() => {
    axios.get("/api/species")
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
        const res = await axios.get("/api/fishing", {
          headers: { Authorization: "Bearer " + token }
        });
        setFishings(res.data);
      } catch {
        setFishings([]);
      }
    };
    fetchFishings();
  }, []);

  // Получение прогноза
  const handleForecast = async ({ location, coords, species, date, timeOfDay }) => {
    setForecast(null);
    setForecastGpt("");
    setForecastError("");
    setForecastGptError("");
    setLoading(true);
    try {
      let lat, lon;
      if (coords.lat && coords.lon) {
        lat = coords.lat;
        lon = coords.lon;
      } else if (location) {
        const geo = await axios.get("/api/geocode?city=" + encodeURIComponent(location));
        lat = geo.data.lat;
        lon = geo.data.lon;
      } else {
        setForecastError("Укажите город или выберите точку на карте!");
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/forecast",
        { species, lat, lon, date, timeOfDay },
        { headers: { Authorization: "Bearer " + token } }
      );
      setForecast(res.data);

      setForecastGptLoading(true);
      try {
        const gptRes = await axios.post(
          "/api/forecast/live-forecast",
          {
            facts: res.data.details?.map(d => d.explanation).join("; ") || "",
            place: location,
            date,
            weather: res.data.weather || "",
            species,
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
    setLoading(false);
  };

  return (
    <div>
      <h1>Главная — AI-Fishing</h1>
      <ForecastForm
        fishList={fishList}
        form={form}
        setForm={setForm}
        onSubmit={handleForecast}
        loading={loading}
      />
      {/* Блок предупреждения */}
      <WarningBlock forecast={forecast} />

      {/* Основной прогноз */}
      <ForecastResult forecast={forecast} error={forecastError} />

      {/* Совет AI */}
      <AIGptAdvice
        forecastGpt={forecastGpt}
        loading={forecastGptLoading}
        error={forecastGptError}
      />

      <button onClick={() => navigate("/add")}>Добавить рыбалку</button>
      <h2>Мои рыбалки:</h2>
      <UserFishingList fishings={fishings} />
    </div>
  );
}
