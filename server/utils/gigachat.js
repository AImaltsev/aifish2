process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('dotenv').config();
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const CLIENT_ID = process.env.SBER_CLIENT_ID;
const CLIENT_SECRET = process.env.SBER_CLIENT_SECRET;

async function getAccessToken() {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const resp = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': crypto.randomUUID(),
      'Authorization': `Basic ${basicAuth}`,
    },
    body: 'scope=GIGACHAT_API_PERS'
  });
  if (!resp.ok) throw new Error('Не удалось получить токен: ' + resp.status + ' ' + await resp.text());
  const data = await resp.json();
  return data.access_token;
}

async function askGigaChat(prompt) {
  const accessToken = await getAccessToken();
  const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages: [
        { "role": "user", "content": prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });
  if (!response.ok) throw new Error('Ошибка запроса к GigaChat: ' + response.status + ' ' + await response.text());
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Ошибка генерации";
}

module.exports = { askGigaChat };
