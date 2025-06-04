import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:4000/api/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Вход</h2>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Пароль" />
      <button type="submit">Войти</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <p>Нет аккаунта? <a href="/register">Регистрация</a></p>
    </form>
  );
}
