import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Encyclopedia from "./Encyclopedia";

// Заглушки для разделов
function Users() {
  return <div>Раздел “Пользователи” (пока заглушка)</div>;
}
function FeedAdmin() {
  return <div>Раздел “Лента рыбалок” (пока заглушка)</div>;
}

const PASSWORD_KEY = "ai_fish_admin_password";

export function getAdminPassword() {
  return sessionStorage.getItem(PASSWORD_KEY) || "";
}

export default function AdminPanel() {
  const [password, setPassword] = useState(sessionStorage.getItem(PASSWORD_KEY) || "");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  if (!password) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <h2>Вход в админ-панель</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (input.trim()) {
              sessionStorage.setItem(PASSWORD_KEY, input);
              setPassword(input);
              setError("");
            } else {
              setError("Введите пароль");
            }
          }}
        >
          <input
            type="password"
            placeholder="Пароль"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ fontSize: 18, padding: 8, marginBottom: 10, width: 220 }}
          /><br />
          <button type="submit" style={{ fontSize: 18, padding: "6px 20px" }}>
            Войти
          </button>
        </form>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  const logout = () => {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword("");
    setInput("");
    window.location.reload();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7fafd" }}>
      <aside style={{
        width: 220,
        background: "#f1f2f6",
        padding: 24,
        borderRight: "1px solid #e2e5ea",
        fontSize: 17
      }}>
        <div style={{ marginBottom: 30, fontWeight: 700, fontSize: 20 }}>
          Админ-панель
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/adminka/encyclopedia">Энциклопедия рыб</Link>
          <Link to="/adminka/users">Пользователи</Link>
          <Link to="/adminka/feed">Лента рыбалок</Link>
        </nav>
        <button onClick={logout} style={{ marginTop: 24, fontSize: 15, color: "#777" }}>
          Выйти
        </button>
      </aside>
      <main style={{ flex: 1, padding: 36 }}>
        <Routes>
          <Route path="encyclopedia" element={<Encyclopedia />} />
          <Route path="users" element={<Users />} />
          <Route path="feed" element={<FeedAdmin />} />
          <Route path="*" element={<div>Выберите раздел админки</div>} />
        </Routes>
      </main>
    </div>
  );
}
