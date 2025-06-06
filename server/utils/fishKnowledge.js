const fs = require('fs');
const path = require('path');
const FILE_PATH = path.join(__dirname, '../fish_knowledge.json');

function readFishKnowledge() {
  if (!fs.existsSync(FILE_PATH)) return {};
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
}

function writeFishKnowledge(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function addOrMergeFishData(fishName, newObj) {
  let knowledge = readFishKnowledge();

  // Если этой рыбы ещё нет — просто создаём массив
  if (!knowledge[fishName]) {
    knowledge[fishName] = [newObj];
  } else {
    // Проверяем, есть ли такой source (например, "Горяйнов")
    const exists = knowledge[fishName].some(obj => obj.source === newObj.source);
    if (!exists) {
      knowledge[fishName].push(newObj);
    } else {
      // Можно обновить данные если нужно, или просто ничего не делать
      // knowledge[fishName] = knowledge[fishName].map(obj =>
      //   obj.source === newObj.source ? newObj : obj
      // );
    }
  }
  writeFishKnowledge(knowledge);
  return knowledge;
}

module.exports = {
  readFishKnowledge,
  writeFishKnowledge,
  addOrMergeFishData
};
