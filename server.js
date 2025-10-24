import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { sendMessage } from "./src/api/telegram.js";



const app = express();
app.use(cors());
app.use(express.json());

// Настройка __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Обработка данных формы
app.post("/api/send", async (req, res) => {
  const { name, email, message } = req.body;
  const text = `📨 Новая заявка с сайта:\n👤 Имя: ${name}\n📧 Email: ${email}\n💬 Сообщение: ${message}`;
  try {
    await sendMessage(text);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Отдача статической страницы
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
