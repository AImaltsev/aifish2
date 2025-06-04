import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [fishings, setFishings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFishings = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/api/fishing", {
        headers: { Authorization: "Bearer " + token }
      });
      setFishings(res.data);
    };
    fetchFishings();
  }, []);

  return (
    <div>
      <h1>Главная — AI-Fishing</h1>
      <button onClick={() => navigate("/add")}>Добавить рыбалку</button>
      <h2>Мои рыбалки:</h2>
      {fishings.length === 0 && <p>Нет рыбалок. Добавьте первую!</p>}
      <ul>
        {fishings.map(f => (
          <li key={f.id}>
            <b>{f.location}</b> — {new Date(f.date).toLocaleDateString()} — {f.fishSpecies?.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
