process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const AUTHORIZATION_KEY = process.env.SBER_AUTHORIZATION_KEY;

let cachedToken = null;
let cachedTokenExpires = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpires - 60 * 1000) {
    return cachedToken;
  }
  const agent = new https.Agent({ rejectUnauthorized: false });

  const resp = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': crypto.randomUUID(),
      'Authorization': `Basic ${AUTHORIZATION_KEY}`,
    },
    body: 'scope=GIGACHAT_API_PERS',
    agent: agent,
  });

  if (!resp.ok) {
    throw new Error(
      'Не удалось получить токен: ' + resp.status + ' ' + (await resp.text())
    );
  }
  const data = await resp.json();
  cachedToken = data.access_token;
  cachedTokenExpires = Date.now() + 1000 * 60 * 29;
  return cachedToken;
}

async function askGigaChat(prompt) {
  const accessToken = await getAccessToken();
  const agent = new https.Agent({ rejectUnauthorized: false });
  const response = await fetch(
    'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
      agent: agent,
    }
  );
  if (!response.ok) {
    throw new Error(
      'Ошибка запроса к GigaChat: ' +
      response.status +
      ' ' +
      (await response.text())
    );
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Ошибка генерации';
}

module.exports = { askGigaChat };
