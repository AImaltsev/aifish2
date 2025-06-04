import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Здесь можно делать запрос к твоему NestJS backend'у (или сразу к базе, если логика внутри Next.js)
    // Ниже пример отправки на твой основной backend:
    const backendUrl = process.env.BACKEND_URL + "/admin/knowledge-base/upload";
    const { data } = req.body;
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (response.ok) return res.status(200).json({ ok: true });
    return res.status(500).json({ error: "Не удалось отправить данные на сервер" });
  }
  res.status(405).json({ error: "Метод не поддерживается" });
}
