import { useEffect, useState } from "react";

// Список шагов анализа (можно расширять!)
const STEPS = [
  "Анализирую температуру воздуха...",
  "Анализирую температуру воды...",
  "Проверяю давление...",
  "Оцениваю скорость и направление ветра...",
  "Проверяю фазу луны...",
  "Анализирую погодные условия...",
  "Сравниваю с Big Data по Волге...",
  "Учитываю опыт рыболовов и экспертов...",
  "Оцениваю миграцию рыбы...",
  "Подбираю лучшие снасти и приманки...",
  "Генерирую персонализированный прогноз..."
];

const STEP_DURATION = 800; // мс

export default function ForecastProgressBar({ onComplete }) {
  const [step, setStep] = useState(0);
  const [showStep, setShowStep] = useState(true);
  const progress = (step / STEPS.length) * 100;

  useEffect(() => {
    if (step < STEPS.length) {
      setShowStep(false);
      // Плавно скрываем прошлый шаг
      const fadeOutTimer = setTimeout(() => {
        setShowStep(true);
        // Через fade-out показываем новый шаг
        const timer = setTimeout(() => setStep(step + 1), STEP_DURATION);
        return () => clearTimeout(timer);
      }, 120); // короткий fade-out
      return () => clearTimeout(fadeOutTimer);
    } else {
      // Даем полосе чуть догнать 100%
      const timer = setTimeout(() => {
        if (typeof onComplete === "function") onComplete();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto 32px auto",
        padding: "26px 32px",
        border: "1.5px solid #e3e7f5",
        borderRadius: 18,
        background: "#f9fbff",
        boxShadow: "0 6px 32px rgba(44,62,80,0.10)"
      }}
    >
      <div style={{ marginBottom: 24, fontWeight: 700, fontSize: 22, color: "#2563eb" }}>
        Мощный анализ... Ждите прогноз!
      </div>
      <div style={{
        height: 22,
        background: "#e4eaf1",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
        border: "1px solid #dbe5f7"
      }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #429cff 0%, #2563eb 100%)",
            transition: "width 0.8s cubic-bezier(.67,-0.23,.44,1.09)"
          }}
        />
      </div>
      <div
        style={{
          color: "#232943",
          minHeight: 28,
          fontSize: 17,
          marginBottom: 4,
          opacity: showStep ? 1 : 0,
          transition: "opacity 0.3s"
        }}
      >
        {STEPS[step] || "Прогноз готов!"}
      </div>
      <div style={{
        color: "#99a3b7",
        fontSize: 13,
        marginTop: 8,
        minHeight: 60,
        transition: "all 0.5s"
      }}>
        {step > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {STEPS.slice(0, step).map((s, i) => (
              <li
                key={i}
                style={{
                  opacity: 0.9,
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#51d88a",
                    marginRight: 7,
                    fontSize: 11,
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: "15px"
                  }}
                >✔</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
