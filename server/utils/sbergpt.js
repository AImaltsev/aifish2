const fetch = require('node-fetch');

const SBER_GPT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
const SBER_GPT_TOKEN = process.env.SBER_GPT_TOKEN; // Положи свой API-ключ в .env

async function generateText(prompt) {
  const response = await fetch(SBER_GPT_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SBER_GPT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "GigaChat", // или GigaChat-Pro (если доступен)
      messages: [
        { "role": "user", "content": prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  // console.log(data); // Посмотри структуру, может быть другая!
  return data.choices?.[0]?.message?.content || "Ошибка генерации";
}

module.exports = { generateText };
