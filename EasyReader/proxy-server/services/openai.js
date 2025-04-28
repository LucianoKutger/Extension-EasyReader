const openai = require("openai");
require('dotenv').config()


//env vars
const API_KEY_VALUE = process.env.OPENAI_API_KEY;
const SYSTEM_INSTRUCTIONS = process.env.SYSTEM_INSTRUCTIONS;

const client = new openai.OpenAI({ apiKey: OPENAI_API_KEY });



async function translateParagraph(paragraph) {

  if (!paragraph) {
    throw new Error("there is no Pragraph to translate");
  }

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

  return response.choices[0].message.content;
}

module.exports = { translateParagraph };
