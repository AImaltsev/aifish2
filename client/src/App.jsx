import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AddFishing from "./pages/AddFishing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import AdminPanel from "./components/AdminPanel";

function App() {
  const isAuth = !!localStorage.getItem("token"); // простая проверка входа

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
        <Route path="/add" element={isAuth ? <AddFishing /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/adminka/*" element={<AdminPanel />} />
        {/* ...другие страницы */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
