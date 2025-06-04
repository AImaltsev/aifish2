import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const isAuth = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{
      display: "flex", gap: 16, alignItems: "center",
      background: "#eef", padding: 12, borderRadius: 8, marginBottom: 20
    }}>
      <Link to="/">Главная</Link>
      {isAuth && <Link to="/my">Мои рыбалки</Link>}
      {isAuth && <Link to="/add">Добавить рыбалку</Link>}
      {isAuth && <Link to="/profile">Профиль</Link>}
      <span style={{ flex: 1 }} />
      {!isAuth && <Link to="/login">Вход</Link>}
      {!isAuth && <Link to="/register">Регистрация</Link>}
      {isAuth && (
        <button
          onClick={handleLogout}
          style={{
            background: "#d66",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Выйти
        </button>
      )}
    </nav>
  );
}
