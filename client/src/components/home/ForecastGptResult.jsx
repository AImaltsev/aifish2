export default function ForecastGptResult({ forecastGpt, loading, error }) {
  if (loading) {
    return (
      <div style={{
        padding: 14, background: "#f2f8ff", borderRadius: 10, marginBottom: 12, color: "#2563eb"
      }}>Генерируем совет от ИИ…</div>
    );
  }
  if (error) {
    return <div style={{ color: "red", marginBottom: 10 }}>{error}</div>;
  }
  if (!forecastGpt) return null;
  return (
    <div style={{
      border: "2px dashed #51d88a",
      background: "#f6fff8",
      marginBottom: 20,
      padding: 14,
      borderRadius: 10,
      fontSize: 17,
      lineHeight: 1.5
    }}>
      <b>Совет AI-рыболова:</b>
      <div style={{ marginTop: 8, whiteSpace: "pre-line" }}>{forecastGpt}</div>
    </div>
  );
}
