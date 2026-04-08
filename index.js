const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ✅ MAIN ROUTE
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const question = req.body.question || "Analyze this dataset";

    // Read file
    const fileContent = fs.readFileSync(req.file.path, 'utf8');

    // Parse CSV
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data;
    const columns = parsed.meta.fields || [];

    const sampleRows = rows.slice(0, 20);

    // 🔥 PROMPT
    const prompt = `
You are an expert data analyst.

Columns: ${columns.join(', ')}

Sample Data:
${JSON.stringify(sampleRows, null, 2)}

Question: ${question}

Give insights in simple words.
`;

    // 🔥 GROQ CALL (NOW CORRECT)
    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a data analyst." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const response = groqResponse.data.choices[0].message.content;

    // Delete file
    fs.unlinkSync(req.file.path);

    res.json({
      result: {
        insights: response,
        explanation: response,
        chartData: null
      }
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});