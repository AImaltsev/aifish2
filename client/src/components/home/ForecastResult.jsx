function getLevelColor(level) {
  if (level === "отличный") return "#51d88a";
  if (level === "средний") return "#ffc107";
  if (level === "слабый") return "#ff5f5f";
  return "#aab";
}

export default function ForecastResult({ forecast }) {
  return (
    <div
      style={{
        border: `2px solid ${getLevelColor(
          forecast.stats && forecast.stats.excellent > 0
            ? "отличный"
            : forecast.stats && forecast.stats.medium > 0
              ? "средний"
              : "слабый"
        )}`,
        background: "#fafdff",
        marginBottom: 20,
        padding: 14,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "inline-block",
            background:
              getLevelColor(
                forecast.stats && forecast.stats.excellent > 0
                  ? "отличный"
                  : forecast.stats && forecast.stats.medium > 0
                    ? "средний"
                    : "слабый"
              ),
            marginRight: 8,
          }}
        ></span>
        <b>
          Клёв: {forecast.verdict?.toUpperCase() || "?"}
        </b>
      </div>
      <div style={{ marginBottom: 10, color: "#697", fontSize: 15 }}>
        {forecast.moonPhase && <>Фаза луны: <b>{forecast.moonPhase}</b><br /></>}
        {forecast.date && <>Дата прогноза: {forecast.date}<br /></>}
      </div>
      {forecast.details && forecast.details.length > 0 && (
        <div>
          <b>Анализ по источникам:</b>
          <ul style={{ margin: "8px 0 0 18px" }}>
            {forecast.details.map((d, i) => (
              <li key={i} style={{ marginBottom: 7 }}>
                <b>{d.source}:</b>{" "}
                <span style={{ color: getLevelColor(d.level), fontWeight: 500 }}>
                  {d.level}
                </span>
                <br />
                <span style={{ fontSize: 15, whiteSpace: "pre-wrap" }}>
                  {d.explanation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
