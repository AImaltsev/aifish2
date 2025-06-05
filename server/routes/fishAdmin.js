const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const FILE_PATH = path.join(__dirname, '../data/fish_knowledge.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "supersecret";


// Middleware — проверка пароля
function isAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: "Unauthorized" });
}


// --- Вспомогательные функции --- //
function readData() {
  if (!fs.existsSync(FILE_PATH)) return {};
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
}
function writeData(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
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


//JSON import/export

router.post('/import', isAdmin, (req, res) => {
  const data = req.body;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Некорректный JSON" });
  }
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Ошибка сохранения файла", detail: e.message });
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
