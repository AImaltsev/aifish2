export default function MyFishings({ fishings }) {
  return (
    <div>
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
