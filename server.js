require('dotenv').config(); // Зареждаме стойностите от .env файл

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { OpenAI } = require('openai'); // Импортираме OpenAI SDK

const app = express();
const PORT = 3000;  // Можеш да промениш порта, ако искаш

app.use(cors()); // Позволяваме CORS (ако фронтендът е на различен домейн)
app.use(bodyParser.json()); // За да обработваш JSON данни

// Проверка дали сме в правилната среда за зареждане на .env файловете
if (!process.env.OPENAI_API_KEY || !process.env.VOICERSS_API_KEY) {
  console.error("Липсват важни API ключове в .env файла.");
  process.exit(1); // Спираме сървъра, ако липсват API ключове
}

// Инициализация на OpenAI API клиента с ключ от .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Зареждаме ключа от .env
});

// Рут за обобщаване на текста
app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).send('Няма текст за обобщаване!');
  }

  try {
    // Използваме OpenAI за обобщаване
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Моделът за генерация на текст
      messages: [{ role: 'user', content: `Моля, обобщи този текст: ${text}` }],
    });

    const summarizedText = response.choices[0].message.content;
    res.json({ summary: summarizedText });
  } catch (error) {
    console.error('Грешка при обобщаването:', error);
    res.status(500).send('Възникна грешка при обобщаването на текста');
  }
});

// Рут за преобразуване в аудио
app.post('/convert-to-audio', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).send('Няма текст за преобразуване в аудио!');
  }

  const VOICERSS_API_KEY = process.env.VOICERSS_API_KEY; // Зареждаме API ключа от .env

  try {
    const audioUrl = `https://api.voicerss.org/?key=${VOICERSS_API_KEY}&hl=bg-bg&src=${encodeURIComponent(text)}&r=0`;
    res.json({ audioUrl });
  } catch (error) {
    console.error('Грешка при преобразуването в аудио:', error);
    res.status(500).send('Възникна грешка при преобразуването в аудио');
  }
});

// Стартиране на сървъра
app.listen(PORT, () => {
  console.log(`Сървърът работи на http://localhost:${PORT}`);
});

// Проверка дали API ключовете са заредени правилно
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "OK" : "Missing");
console.log("VoiceRSS API Key:", process.env.VOICERSS_API_KEY ? "OK" : "Missing");

