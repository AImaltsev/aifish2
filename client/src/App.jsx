import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AddFishing from "./pages/AddFishing";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const isAuth = !!localStorage.getItem("token"); // простая проверка входа

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
        <Route path="/add" element={isAuth ? <AddFishing /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ...другие страницы */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
