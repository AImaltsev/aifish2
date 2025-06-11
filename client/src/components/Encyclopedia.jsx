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

export default function Encyclopedia() {
  const [fishList, setFishList] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [editData, setEditData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [showPasteJson, setShowPasteJson] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);
  const [addSourceFish, setAddSourceFish] = useState(null);
  const [addSourceData, setAddSourceData] = useState({});


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
      if (typeof json !== "object" || Array.isArray(json) || !json) {
        setError("Импортируемый файл должен быть JSON-объектом!");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/fish-admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getAdminPassword()
        },
        body: JSON.stringify(json)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка импорта");
      }
      await loadFish();
      setError("");
    } catch (err) {
      setError("Ошибка импорта: " + err.message);
    }
    setLoading(false);
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
      <button onClick={() => setShowPasteJson(true)} style={{ marginLeft: 12 }}>
        Вставить JSON
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
                <td>
                  {/* Если несколько источников — показать все */}
                  {arr.map((entry, idx) => (
                    <div key={idx} style={{ marginBottom: 3 }}>
                      <span style={{ fontWeight: 500 }}>{entry.source || "Источник не указан"}</span>
                      <button
                        style={{ marginLeft: 8 }}
                        onClick={() => startEdit(name, entry, false)}
                      >
                        Подробнее
                      </button>
                      <button
                        style={{ marginLeft: 4 }}
                        onClick={() => startEdit(name, entry, true)}
                      >
                        Редактировать
                      </button>
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    style={{ marginTop: 4, marginBottom: 4 }}
                    onClick={() => {
                      setAddSourceFish(name);
                      setAddSourceData({});
                      setShowAddSource(true);
                    }}
                  >
                    + Добавить источник
                  </button>
                  <button onClick={() => deleteFish(name)} style={{ color: "red", marginLeft: 8 }}>
                    Удалить вид полностью
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

      {showPasteJson && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
        }}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 8, width: 500 }}>
            <h3>Вставьте JSON-код</h3>
            <textarea
              value={pastedJson}
              onChange={e => setPastedJson(e.target.value)}
              rows={14}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
            <div style={{ marginTop: 18 }}>
              <button
                onClick={async () => {
                  try {
                    const json = JSON.parse(pastedJson);
                    // Отправка на сервер
                    const res = await fetch("/api/fish-admin/import", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "x-admin-password": getAdminPassword(),
                      },
                      body: JSON.stringify(json),
                    });
                    if (!res.ok) throw new Error("Ошибка импорта");
                    setShowPasteJson(false);
                    setPastedJson("");
                    await loadFish();
                    setError("");
                  } catch (err) {
                    setError("Ошибка импорта: " + err.message);
                  }
                }}
                style={{ marginRight: 10 }}
              >Импортировать</button>
              <button onClick={() => setShowPasteJson(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {showAddSource && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
        }}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 8, width: 500 }}>
            <h3>Добавить источник для: {addSourceFish}</h3>
            <input
              placeholder="Источник/автор"
              value={addSourceData.source || ""}
              onChange={e => setAddSourceData(d => ({ ...d, source: e.target.value }))}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              placeholder="Сезон (через запятую)"
              value={addSourceData.season || ""}
              onChange={e => setAddSourceData(d => ({ ...d, season: e.target.value }))}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              placeholder="Температура (например: 7,18)"
              value={addSourceData.tempRange || ""}
              onChange={e => setAddSourceData(d => ({ ...d, tempRange: e.target.value }))}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              placeholder="Погода (через запятую)"
              value={addSourceData.weatherGood || ""}
              onChange={e => setAddSourceData(d => ({ ...d, weatherGood: e.target.value }))}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <input
              placeholder="Совет по снасти"
              value={addSourceData.tackleAdvice || ""}
              onChange={e => setAddSourceData(d => ({ ...d, tackleAdvice: e.target.value }))}
              style={{ width: "100%", marginBottom: 10 }}
            />
            {/* ...Добавь еще поля если надо */}
            <div style={{ marginTop: 18 }}>
              <button
                onClick={async () => {
                  // Форматируем данные для отправки
                  const formattedSource = {
                    source: addSourceData.source,
                    season: (addSourceData.season || "").split(",").map(s => s.trim()).filter(Boolean),
                    tempRange: (addSourceData.tempRange || "").split(",").map(Number).filter(Boolean),
                    weatherGood: (addSourceData.weatherGood || "").split(",").map(s => s.trim()).filter(Boolean),
                    tackleAdvice: addSourceData.tackleAdvice ? [addSourceData.tackleAdvice] : [],
                  };
                  // Отправка на сервер
                  const res = await fetch(`/api/fish-admin/add-source/${encodeURIComponent(addSourceFish)}`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-admin-password": getAdminPassword(),
                    },
                    body: JSON.stringify(formattedSource),
                  });
                  if (res.ok) {
                    setShowAddSource(false);
                    setAddSourceFish(null);
                    setAddSourceData({});
                    await loadFish();
                  } else {
                    alert("Ошибка добавления источника");
                  }
                }}
                style={{ marginRight: 10 }}
              >Сохранить</button>
              <button onClick={() => setShowAddSource(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

}

