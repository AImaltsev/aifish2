import { useEffect, useState } from "react";

// Список этапов анализа, можно расширять!
const STEPS = [
  "температуры воздуха",
  "температуры воды",
  "атмосферного давления",
  "скорости и направления ветра",
  "облачности и осадков",
  "фазы луны",
  "уровня воды и течения",
  "сезонных особенностей вида",
  "источников данных Сабанеева и Горяйнова",
  "Big Data по отчётам рыболовов",
  "вашей личной истории рыбалок",
];

export default function ForecastProgressBar({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  // Прогресс в процентах
  const progress = Math.round((currentStep / STEPS.length) * 100);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timeout = setTimeout(() => setCurrentStep(s => s + 1), 450);
      return () => clearTimeout(timeout);
    } else if (!finished) {
      setFinished(true);
      setTimeout(onComplete, 400); // Пауза перед показом прогноза
    }
  }, [currentStep, finished, onComplete]);

  return (
    <div style={{
      border: "1.5px solid #2563eb",
      borderRadius: 14,
      background: "#f7faff",
      margin: "20px auto",
      maxWidth: 480,
      boxShadow: "0 4px 28px #2563eb11",
      padding: 24,
      textAlign: "center"
    }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, color: "#2563eb" }}>
        Генерируем прогноз клёва для вас...
      </div>
      <div style={{
        width: "100%",
        background: "#e8eefd",
        height: 22,
        borderRadius: 12,
        marginBottom: 18,
        overflow: "hidden",
        boxShadow: "0 1px 3px #2563eb0a"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg,#2563eb 60%,#3bb08f 100%)",
          transition: "width 0.35s cubic-bezier(.4,2.8,.6,1)"
        }} />
      </div>
      <div style={{ fontSize: 17, color: "#445", marginBottom: 10 }}>
        Выполняю анализ <b>{STEPS[Math.min(currentStep, STEPS.length - 1)]}</b>...
      </div>
      <div style={{
        textAlign: "left",
        margin: "8px auto",
        maxWidth: 420,
        minHeight: 50,
        fontSize: 15
      }}>
        {STEPS.slice(0, currentStep).map((step, idx) => (
          <div key={idx} style={{ color: "#4ca37e" }}>
            ✔ {step.charAt(0).toUpperCase() + step.slice(1)} — <span style={{ color: "#888" }}>Готово</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, color: "#2563ebbb", fontSize: 14, letterSpacing: 1 }}>
        <span style={{ fontWeight: 500 }}>
          {progress}%
        </span> завершено
      </div>
    </div>
  );
}
