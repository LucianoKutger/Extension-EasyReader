const openai = require("openai");

const url = require("url");
const express = require("express");
const router = express.Router();
const needle = require("needle");

//Env vars
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const SYSTEM_INSTRUCTIONS = process.env.SYSTEM_INSTRUCTIONS;

const client = new openai.OpenAI({ apiKey: API_KEY_VALUE });

router.use(express.json());

router.post("/translate", async (req, res) => {
  const { paragraph } = req.body;

  if (!paragraph) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: SYSTEM_INSTRUCTIONS,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: paragraph,
            },
          ],
        },
      ],
    });

    res.status(200).json({ response: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});


module.exports = router;
