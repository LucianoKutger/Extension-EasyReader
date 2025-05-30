const openai = require("openai");
require("dotenv").config();




//env vars
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SYSTEM_INSTRUCTIONS = process.env.SYSTEM_INSTRUCTIONS;

const client = new openai.OpenAI({ apiKey: OPENAI_API_KEY });



async function translateParagraph(paragraph) {
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

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Fehler: ', error)
    throw error
  }
}

module.exports = { translateParagraph };
