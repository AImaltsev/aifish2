process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const SBER_GPT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
const SBER_GPT_TOKEN = process.env.SBER_GPT_TOKEN;

async function generateText(prompt) {
  const response = await fetch(SBER_GPT_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SBER_GPT_TOKEN}`,
      "Content-Type": "application/json"
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
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Ошибка генерации";
}

module.exports = { generateText };
