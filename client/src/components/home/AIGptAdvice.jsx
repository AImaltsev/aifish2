// src/components/home/AIGptAdvice.jsx
export default function AIGptAdvice({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "#f2f7fb",
      border: "1.5px solid #2563eb",
      borderRadius: 12,
      padding: 18,
      marginBottom: 20,
      fontSize: 16,
      color: "#1741a6"
    }}>
      <b>Совет AI-рыболова:</b>
      <div style={{ marginTop: 6, whiteSpace: "pre-line" }}>
        {text}
      </div>
    </div>
  );
}
