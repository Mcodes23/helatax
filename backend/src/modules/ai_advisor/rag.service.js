import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../../utils/logger.js";

export const askAiAdvisor = async (userQuestion, userContext) => {
  try {
    // 1. Check for Key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env file");
    }

    // 2. Initialize Gemini (Free Tier)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 3. Construct the "General Expert" Prompt
    // We removed the strict constraints that limited it to only SME/Freelancer logic.
    const fullPrompt = `
      ROLE: You are HelaTax, Kenya's premier AI Tax Consultant.
      
      USER CONTEXT: 
      - Profession: ${userContext.profession || "General User"}
      - Current Mode: ${userContext.tax_mode || "Not Set"}

      KNOWLEDGE BASE (MANDATORY):
      - Answer strictly based on the **Income Tax Act (Cap 470)**, **VAT Act (2013)**, **Tax Procedures Act**, and **Finance Acts 2023-2025**.
      - You cover ALL Kenyan tax heads: PAYE, VAT, Turnover Tax, Income Tax, Capital Gains, Excise, and Rental Income.

      SPECIFIC GUIDANCE FOR THIS USER:
      - If they ask about their specific filing (Turnover/Income), use their 'Current Mode' context.
      - If they ask general questions (e.g., "What is Capital Gains Tax?"), answer generally for Kenya (Rate is 15%).
      
      CRITICAL COMPLIANCE RULES:
      1. Late Filing Penalty (Individual): Higher of 5% of tax due or Ksh. 2,000.
      2. Late Filing Penalty (Company): Higher of 5% of tax due or Ksh. 20,000.
      3. Late Payment Interest: 1% per month.
      4. eTIMS: Valid electronic invoices are mandatory for all expense claims (Sec 16).
      5. Reliefs: Personal Relief is Ksh 2,400/month. Insurance Relief is 15% (capped at Ksh 5,000/month).

      TONE: Professional, Accurate, and Concise.

      USER QUESTION: "${userQuestion}"
    `;

    // 4. Generate Content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    logger.error(`AI Service Error: ${error.message}`);
    if (error.message.includes("404")) {
      return "System Error: AI Model not found. Please contact admin.";
    }
    return "I'm having trouble connecting to the HelaTax brain right now. Please try again later.";
  }
};
