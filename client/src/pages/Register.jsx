import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await axios.post("http://localhost:4000/api/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500); // после успешной регистрации переходим на вход
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Пароль" />
      <input name="name" value={form.name} onChange={handleChange} placeholder="Имя (необязательно)" />
      <button type="submit">Зарегистрироваться</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>Регистрация успешна! Перенаправляем на вход...</div>}
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </form>
  );
}
