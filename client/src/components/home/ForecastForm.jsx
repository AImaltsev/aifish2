// src/components/home/ForecastForm.jsx
import MapPicker from "../MapPicker";

export default function ForecastForm({
  form, coords, fishList, handleChange, setCoords, resetCoords,
  handleGeolocate, handleForecast, loading
}) {
  return (
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
          onClick={handleGeolocate}
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
      <button type="submit" disabled={loading}>Показать прогноз</button>
    </form>
  );
}
