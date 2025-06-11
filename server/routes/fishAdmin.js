const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { addOrMergeFishData } = require('../utils/fishKnowledge');

const FISH_KNOWLEDGE_PATH = path.join(__dirname, '../data/fish_knowledge.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "supersecret";

// Middleware — проверка пароля
function isAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// --- Вспомогательные функции --- //
function readData() {
  if (!fs.existsSync(FISH_KNOWLEDGE_PATH)) return {};
  return JSON.parse(fs.readFileSync(FISH_KNOWLEDGE_PATH, 'utf-8'));
}
function writeData(data) {
  fs.writeFileSync(FISH_KNOWLEDGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Авторизация --- //
router.use((req, res, next) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// --- Получить всех рыб --- //
router.get('/', (req, res) => {
  res.json(readData());
});

// --- Добавить новый вид --- //
router.post('/', (req, res) => {
  const { name, data } = req.body;
  if (!name) return res.status(400).json({ error: "Имя обязательно" });
  const db = readData();
  if (db[name]) return res.status(400).json({ error: "Такой вид уже есть" });
  db[name] = [data];
  writeData(db);
  res.json({ ok: true });
});

// --- Импорт JSON с МЕРДЖЕМ данных --- //
router.post('/import', isAdmin, (req, res) => {
  try {
    const imported = req.body;
    const db = readData();

    // Вариант 1: { fishName, fishData } (одна рыба)
    if (imported.fishName && imported.fishData) {
      const name = imported.fishName;
      const data = imported.fishData;
      if (!db[name]) db[name] = [];
      // Если source такого уже есть — не добавлять
      if (!db[name].some(e => e.source === data.source)) {
        db[name].push(data);
      }
      writeData(db);
      return res.json({ ok: true, added: name });
    }

    // Вариант 2: обычный объект { "щука": [ ... ], ... }
    if (typeof imported === "object" && !Array.isArray(imported)) {
      for (const [species, arr] of Object.entries(imported)) {
        if (!Array.isArray(arr)) continue;
        if (!db[species]) {
          db[species] = arr;
        } else {
          arr.forEach(newEntry => {
            const exists = db[species].some(e => e.source === newEntry.source);
            if (!exists) db[species].push(newEntry);
          });
        }
      }
      writeData(db);
      return res.json({ ok: true });
    }

    res.status(400).json({ error: "Неподдерживаемый формат данных" });
  } catch (e) {
    console.error("Ошибка записи файла:", e);
    res.status(500).json({ error: "Ошибка сохранения файла", detail: e.message });
  }
});

// Новый роут для добавления знаний по рыбе (оставляем, если нужен)
router.post('/add-fish-knowledge', (req, res) => {
  const { fishName, fishData } = req.body;
  if (!fishName || !fishData) {
    return res.status(400).json({ error: 'fishName и fishData обязательны' });
  }
  const result = addOrMergeFishData(fishName, fishData);
  res.json({ success: true, data: result });
});

router.post("/add-source", (req, res) => {
  const { fish, newSource } = req.body;
  if (!fish || !newSource || !newSource.source) {
    return res.status(400).json({ error: "Недостаточно данных" });
  }
  try {
    const data = JSON.parse(fs.readFileSync(FISH_KNOWLEDGE_PATH, "utf8"));
    if (!data[fish]) data[fish] = [];
    data[fish].push(newSource);
    fs.writeFileSync(FISH_KNOWLEDGE_PATH, JSON.stringify(data, null, 2), "utf8");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка записи", detail: err.message });
  }
});

// --- Обновить или переименовать вид --- //
router.put('/:name', (req, res) => {
  const oldName = req.body.oldName || req.params.name;
  const newName = req.body.name || oldName;
  const db = readData();

  if (!db[oldName]) return res.status(404).json({ error: "Вид не найден" });

  // Если название изменено — переименовываем
  if (newName !== oldName) {
    if (db[newName]) return res.status(400).json({ error: "Вид с таким именем уже существует" });
    db[newName] = [req.body];
    delete db[oldName];
  } else {
    db[oldName] = [req.body];
  }
  writeData(db);
  res.json({ ok: true });
});

// --- Удалить вид --- //
router.delete('/:name', (req, res) => {
  const db = readData();
  const name = req.params.name;
  if (!db[name]) return res.status(404).json({ error: "Вид не найден" });
  delete db[name];
  writeData(db);
  res.json({ ok: true });
});

module.exports = router;
