import { useState, useEffect } from "react";
import axios from "axios";

export function useHomePage(navigate) {
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
  const [forecastGpt, setForecastGpt] = useState("");
  const [forecastGptLoading, setForecastGptLoading] = useState(false);
  const [forecastGptError, setForecastGptError] = useState("");


  useEffect(() => {
    axios.get("/api/species")
      .then(res => {
        setFishList(res.data);
        setForm(f => ({ ...f, species: res.data[0] || "" }));
      })
      .catch(() => setFishList([]));
  }, []);

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

  useEffect(() => {
    async function fetchPlace() {
      if (coords.lat && coords.lon) {
        try {
          const res = await axios.get(`/api/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`);
          const a = res.data.raw?.address || {};
          const water = a.water || a.river || a.lake || a.reservoir || a.stream;
          if (water) {
            let place = water;
            if (a.city) place += `, ${a.city}`;
            else if (a.town) place += `, ${a.town}`;
            else if (a.state) place += `, ${a.state}`;
            setForm(f => ({ ...f, location: place }));
          } else if (res.data.place) {
            setForm(f => ({ ...f, location: res.data.place }));
          }
        } catch { /* ignore */ }
      }
    }
    fetchPlace();
  }, [coords.lat, coords.lon]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleForecast = async e => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
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
        const geo = await axios.get("/api/geocode?city=" + encodeURIComponent(form.location));
        lat = geo.data.lat;
        lon = geo.data.lon;
      } else {
        setForecastError("Укажите город или выберите точку на карте!");
        return;
      }
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/forecast",
        { species: form.species, lat, lon, date: form.date, timeOfDay: form.timeOfDay },
        { headers: { Authorization: "Bearer " + token } }
      );
      setForecast(res.data);

      setForecastGptLoading(true);
      try {
        const gptRes = await axios.post(
          "/api/forecast/live-forecast",
          {
            facts: res.data.details?.map(d => d.explanation).join("; ") || "",
            place: form.location,
            date: form.date,
            weather: res.data.weather || "",
            species: form.species
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

  const resetCoords = () => setCoords({ lat: null, lon: null });

  return {
    fishings,
    fishList,
    form,
    setForm,
    coords,
    setCoords,
    forecast,
    setForecast,
    forecastError,
    setForecastError,
    forecastGpt,
    forecastGptLoading,
    forecastGptError,
    handleChange,
    handleForecast,
    resetCoords
  };
}
