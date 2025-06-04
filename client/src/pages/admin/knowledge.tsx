import { useState } from "react";

export default function AdminKnowledge() {
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(""); setError("");
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: JSON.parse(jsonText) }),
      });
      if (res.ok) setStatus("Данные успешно загружены!");
      else throw new Error(await res.text());
    } catch (err: any) {
      setError("Ошибка: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: 24, border: "1px solid #eaeaea", borderRadius: 16 }}>
      <h2>Загрузка базы знаний (admin)</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          rows={16}
          style={{ width: "100%", fontFamily: "monospace", fontSize: 16, marginBottom: 12 }}
          placeholder='Вставь сюда JSON, например: {"судак":[...]}'
        />
        <button type="submit" style={{ padding: "10px 28px", fontSize: 16 }}>Загрузить</button>
      </form>
      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
