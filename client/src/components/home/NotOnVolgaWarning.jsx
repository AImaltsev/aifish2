export default function NotOnVolgaWarning() {
  return (
    <div style={{
      background: "#ffe69c",
      color: "#775e00",
      padding: "12px 18px",
      borderRadius: 10,
      marginBottom: 15,
      fontWeight: 500,
      border: "1.5px solid #ffc107",
      boxShadow: "0 2px 10px rgba(255,200,70,0.09)"
    }}>
      ⚠️ <b>Внимание!</b> Сейчас наш сервис максимально адаптирован для прогноза на реке <b>Волга</b>.<br />
      Прогноз для выбранного участка строится по тем же алгоритмам, но его точность может быть ниже.<br />
      Сервис постоянно развивается. Следите за новостями, скоро у нас будут все водоёмы<br />
      <span style={{ fontSize: 14, color: '#a08800' }}>Для максимальной точности советуем указывать точки непосредственно на Волге.</span>
    </div>
  );
}
