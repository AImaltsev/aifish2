// src/components/home/WarningBlock.jsx
export default function WarningBlock() {
  return (
    <div style={{
      background: "#fff3cd",
      color: "#856404",
      border: "1.5px solid #ffeb99",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 20,
      fontSize: 15,
      lineHeight: 1.6,
    }}>
      <b>⚠️ Внимание!</b><br />
      Сейчас наш сервис максимально адаптирован для прогноза на реке Волга.<br />
      Прогноз для выбранного участка строится по тем же алгоритмам, но его точность может быть ниже.<br />
      Для максимальной точности советуем указывать точки непосредственно на Волге.<br />
      Сервис развивается — скоро будут все водоёмы!
    </div>
  );
}
