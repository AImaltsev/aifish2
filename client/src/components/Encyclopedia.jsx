import { useEffect, useState } from "react";
import { getAdminPassword } from "./AdminPanel";

// Универсальный редактор: редактирование любого поля (строка, массив, объект)
function DynamicField({ k, value, onChange, onDelete }) {
  const [editVal, setEditVal] = useState(value);

  // Для удобства: строка, массив, объект
  let field;
  if (typeof editVal === "string" || typeof editVal === "number") {
    field = (
      <input
        type="text"
        value={editVal}
        style={{ width: 350 }}
        onChange={e => {
          setEditVal(e.target.value);
          onChange(k, e.target.value);
        }}
      />
    );
  } else if (Array.isArray(editVal)) {
    field = (
      <textarea
        value={editVal.join("\n")}
        rows={editVal.length > 2 ? editVal.length : 3}
        style={{ width: 350 }}
        onChange={e => {
          const arr = e.target.value.split("\n");
          setEditVal(arr);
          onChange(k, arr);
        }}
      />
    );
  } else if (typeof editVal === "object" && editVal !== null) {
    field = (
      <textarea
        value={JSON.stringify(editVal, null, 2)}
        rows={4}
        style={{ width: 350 }}
        onChange={e => {
          try {
            const val = JSON.parse(e.target.value);
            setEditVal(val);
            onChange(k, val);
          } catch {
            // Просто не обновлять пока ошибка парсинга
          }
        }}
      />
    );
  } else {
    field = (
      <input
        type="text"
        value={String(editVal)}
        style={{ width: 350 }}
        onChange={e => {
          setEditVal(e.target.value);
          onChange(k, e.target.value);
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
      <b style={{ width: 120 }}>{k}:</b>
      {field}
      <button style={{ marginLeft: 8, color: "red" }} onClick={() => onDelete(k)}>
        ×
      </button>
    </div>
  );
}


const handleExportJson = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/fish-admin", {
      headers: { "x-admin-password": getAdminPassword() }
    });
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fish_knowledge.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    setError("Ошибка экспорта: " + e.message);
  }
  setLoading(false);
};

// Импорт
const handleImportJson = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setLoading(true);
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const res = await fetch("/api/fish-admin/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": getAdminPassword()
      },
      body: JSON.stringify(json)
    });
    if (!res.ok) throw new Error("Ошибка импорта");
    await loadFish();
    setError("");
  } catch (err) {
    setError("Ошибка импорта: " + err.message);
  }
  setLoading(false);
};

export default function Encyclopedia() {
  const [fishList, setFishList] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [editData, setEditData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [newFieldName, setNewFieldName] = useState("");

  // Загрузка всех рыб
  const loadFish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fish-admin", {
        headers: { "x-admin-password": getAdminPassword() }
      });
      if (!res.ok) throw new Error("Ошибка получения данных");
      const data = await res.json();
      setFishList(Object.entries(data));
      setError("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFish();
  }, []);

  // Открыть карточку или начать добавление/редактирование
  const startEdit = (name, data, editing = false) => {
    setSelectedFish(name);
    setEditData(data ? { ...data } : {});
    setEditMode(editing);
  };

  // Удалить рыбу
  const deleteFish = async name => {
    if (!window.confirm(`Удалить ${name}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fish-admin/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: { "x-admin-password": getAdminPassword() }
      });
      if (!res.ok) throw new Error("Ошибка удаления");
      await loadFish();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Сохранить изменения (PUT/POST)
  const saveFish = async () => {
    setLoading(true);
    try {
      // если меняем имя — отправить и старое, и новое имя!
      const isRename = editData.name && selectedFish && editData.name !== selectedFish;
      const body = isRename
        ? JSON.stringify({ oldName: selectedFish, ...editData })
        : JSON.stringify(editData);

      const url = selectedFish
        ? `/api/fish-admin/${encodeURIComponent(selectedFish)}`
        : "/api/fish-admin";

      const res = await fetch(url, {
        method: selectedFish ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getAdminPassword(),
        },
        body,
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      setSelectedFish(null);
      setEditData({});
      setEditMode(false);
      await loadFish();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Универсальный ввод для любого поля
  const onFieldChange = (k, v) => {
    setEditData(data => ({ ...data, [k]: v }));
  };
  // Удалить поле
  const onFieldDelete = k => {
    setEditData(data => {
      const copy = { ...data };
      delete copy[k];
      return copy;
    });
  };

  // Добавить новое поле в форме
  const addNewField = () => {
    if (!newFieldName.trim()) return;
    setEditData(data => ({ ...data, [newFieldName.trim()]: "" }));
    setNewFieldName("");
  };

  return (
    <div>
      <h2>Энциклопедия рыб</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <input
        placeholder="Поиск по названию"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, padding: 6 }}
      />
      <button onClick={() => startEdit("", { name: "", source: "" }, true)} style={{ marginLeft: 10 }}>
        + Добавить рыбу
      </button>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleExportJson}>Скачать JSON</button>
        <input
          type="file"
          accept=".json"
          style={{ display: "none" }}
          id="fish-import-json"
          onChange={handleImportJson}
        />
        <label htmlFor="fish-import-json" style={{ marginLeft: 12, cursor: "pointer", color: "#1657af" }}>
          Импортировать JSON
        </label>
      </div>
      {loading && <div>Загрузка...</div>}
      <table border={1} cellPadding={6} style={{ marginTop: 12, width: "100%", background: "#fff" }}>
        <thead>
          <tr>
            <th>Вид</th>
            <th>Источник</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {fishList
            .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
            .map(([name, arr]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{arr[0]?.source || ""}</td>
                <td>
                  <button onClick={() => startEdit(name, arr[0], false)}>Подробнее</button>
                  <button onClick={() => startEdit(name, arr[0], true)} style={{ marginLeft: 8 }}>
                    Редактировать
                  </button>
                  <button onClick={() => deleteFish(name)} style={{ color: "red", marginLeft: 8 }}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Карточка: просмотр или редактирование */}
      {editData && (selectedFish !== null || editData.name) && (
        <div style={{
          background: "#f5f6fa", marginTop: 20, padding: 20, borderRadius: 8,
          border: "1px solid #e2e5ea", maxWidth: 700
        }}>
          <h3>
            {editMode
              ? (selectedFish ? `Редактировать "${selectedFish}"` : "Добавить новый вид рыбы")
              : `Карточка вида рыбы`}
          </h3>
          {editMode ? (
            <div>
              {Object.entries(editData).map(([k, v]) =>
                <DynamicField
                  key={k}
                  k={k}
                  value={v}
                  onChange={onFieldChange}
                  onDelete={onFieldDelete}
                />
              )}
              <div style={{ marginTop: 14, display: "flex", alignItems: "center" }}>
                <input
                  placeholder="Новое поле (например, bestTime)"
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  style={{ marginRight: 6, width: 250 }}
                />
                <button type="button" onClick={addNewField}>+ Добавить поле</button>
              </div>
              <div style={{ marginTop: 20 }}>
                <button onClick={saveFish} style={{ marginRight: 12 }}>
                  Сохранить
                </button>
                <button onClick={() => { setSelectedFish(null); setEditData({}); setEditMode(false); }}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              {Object.entries(editData).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <b>{k}:</b>
                  <div style={{ marginLeft: 10, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {Array.isArray(v)
                      ? v.join('\n')
                      : typeof v === 'object' && v !== null
                        ? JSON.stringify(v, null, 2)
                        : String(v)}
                  </div>
                </div>
              ))}
              <button
                onClick={() => { setSelectedFish(null); setEditData({}); setEditMode(false); }}
                style={{ marginTop: 10 }}
              >
                Закрыть
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
