import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import OpenAI from "openai";
import cors from "cors";

console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 AI FUNCTION
async function generateInsights(data, role) {
  try {
    const prompt = `
You are an advanced AI Data Analyst Agent.

User Role: ${role}
Dataset: ${JSON.stringify(data)}

Tasks:
1. Give key insights
2. Explain why trends happened
3. Suggest actionable decisions

Format:

🔍 Key Insights:
...

🧠 Why It Happened:
...

🚀 Recommended Actions:
...

⚠️ Alerts:
...
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return response.output[0].content[0].text;

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    return "Error generating insights";
  }
}

// 🚀 API ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { data, role } = req.body;

    const summary = {
      total_rows: data.length,
      columns: Object.keys(data[0]),
      sample: data.slice(0, 10),
    };

    const result = await generateInsights(summary, role);

    res.json({ result });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).send("Error");
  }
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// 🚀 START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});