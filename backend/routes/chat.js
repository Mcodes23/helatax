import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Initialize OpenAI (Only works if you have an API Key in .env)
// If no key is found, we fall back to "Simulation Mode"
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    // ---------------------------------------------------------
    // OPTION A: REAL AI (Uncomment this block when you have a Key)
    // ---------------------------------------------------------
    /*
    if (openai) {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are HelaTax, a helpful Kenyan tax expert. Answer questions using the Kenyan Finance Act 2024. Keep answers short and simple for freelancers." },
          { role: "user", content: message }
        ],
        model: "gpt-3.5-turbo",
      });
      return res.json({ reply: completion.choices[0].message.content });
    }
    */

    // ---------------------------------------------------------
    // OPTION B: SIMULATION MODE (Free for Testing)
    // ---------------------------------------------------------
    // This simulates an AI response so you can build the UI first.

    let botReply = "I'm not sure about that yet.";

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      botReply =
        "Hello! I am HelaTax AI. How can I help you with your taxes today?";
    } else if (lowerMsg.includes("vat")) {
      botReply =
        "In Kenya, the standard VAT rate is 16%. However, some goods like fuel have a different rate (8%).";
    } else if (lowerMsg.includes("deadline")) {
      botReply =
        "The deadline for filing VAT and PAYE is the 9th of the following month. Turnover tax is due by the 20th.";
    } else if (lowerMsg.includes("turnover")) {
      botReply =
        "Turnover Tax (TOT) is 1.5% of your gross sales if you earn between KES 1M and KES 25M per year.";
    } else {
      botReply =
        "That sounds like a complex tax question. Once you connect my API Key, I can explain it in detail! For now, try asking about 'VAT' or 'Deadlines'.";
    }

    // Simulate a small delay to feel like "thinking"
    setTimeout(() => {
      res.json({ reply: botReply });
    }, 1000);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI Error" });
  }
});

export default router;
