import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddFishing() {
  const [form, setForm] = useState({
    location: "",
    date: "",
    fishSpecies: "",
    tackle: "",
    notes: "",
    isPublic: true,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:4000/api/fishing", {
        ...form,
        fishSpecies: form.fishSpecies.split(",").map(s => s.trim()), // преобразуем строку в массив
        tackle: form.tackle.split(",").map(s => s.trim()),
        date: new Date(form.date).toISOString()
      }, {
        headers: { Authorization: "Bearer " + token }
      });
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Добавить рыбалку</h2>
      <input name="location" value={form.location} onChange={handleChange} placeholder="Место" />
      <input name="date" type="date" value={form.date} onChange={handleChange} placeholder="Дата" />
      <input name="fishSpecies" value={form.fishSpecies} onChange={handleChange} placeholder="Виды рыбы (через запятую)" />
      <input name="tackle" value={form.tackle} onChange={handleChange} placeholder="Снасти (через запятую)" />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Заметки" />
      <label>
        <input name="isPublic" type="checkbox" checked={form.isPublic} onChange={handleChange} />
        Публичная
      </label>
      <button type="submit">Сохранить</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
