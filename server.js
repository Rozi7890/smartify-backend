require('dotenv').config(); // Зареждаме стойностите от .env файл

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;  // Можеш да промениш порта, ако искаш

app.use(cors()); // Позволяваме CORS (ако фронтендът е на различен домейн)
app.use(bodyParser.json()); // За да обработваш JSON данни

// Проверка дали сме в правилната среда за зареждане на .env файловете
if (!process.env.HUGGINGFACE_API_KEY || !process.env.VOICERSS_API_KEY) {
  console.error("Липсват важни API ключове в .env файла.");
  process.exit(1); // Спираме сървъра, ако липсват API ключове
}

// Задаваме HuggingFace API ключа от .env
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const VOICERSS_API_KEY = process.env.VOICERSS_API_KEY; // API ключ за VoicerSS

// Рут за обобщаване на текста
app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).send('Няма текст за обобщаване!');
  }

  try {
    // Използваме HuggingFace за обобщаване
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summarizedText = hfResponse.data[0]?.summary_text || "Неуспешно обобщаване.";
    res.json({ summary: summarizedText });
  } catch (error) {
    console.error('Грешка при HuggingFace API:', error.response?.data || error.message);
    res.status(500).send('Грешка при обобщаването с HuggingFace API');
  }
});

// Рут за преобразуване в аудио
app.post('/convert-to-audio', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).send('Няма текст за преобразуване в аудио!');
  }

  try {
    const audioUrl = `https://api.voicerss.org/?key=${VOICERSS_API_KEY}&hl=bg-bg&src=${encodeURIComponent(text)}&r=0`;
    res.json({ audioUrl });
  } catch (error) {
    console.error('Грешка при преобразуването в аудио:', error);
    res.status(500).send('Грешка при преобразуването в аудио');
  }
});

// Стартиране на сървъра
app.listen(PORT, () => {
  console.log(`Сървърът работи на http://localhost:${PORT}`);
});

// Проверка дали API ключовете са заредени правилно
console.log("HuggingFace API Key:", process.env.HUGGINGFACE_API_KEY ? "OK" : "Missing");
console.log("VoiceRSS API Key:", process.env.VOICERSS_API_KEY ? "OK" : "Missing");
