const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const { habits } = req.body;

    if (!habits || habits.length === 0) {
      return res.status(400).json({ error: "No habits provided" });
    }

    const prompt = `
You are a smart habit coach AI.

Analyze the user's habits and provide:
1. Overall performance
2. Best habit
3. Weakest habit
4. Suggestions for improvement

Habit Data:
${JSON.stringify(habits, null, 2)}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const insight = response.data.choices[0].message.content;

    res.json({ insight });
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to generate insights",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
