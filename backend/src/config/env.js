// backend/config/env.js
import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  // Default Tax Rates (Fallbacks if DB is empty)
  RATES: {
    TOT: parseFloat(process.env.TOT_RATE) || 0.015,
    VAT: parseFloat(process.env.VAT_RATE) || 0.16,
    CORP_RESIDENT: parseFloat(process.env.CORP_TAX_RATE) || 0.3,
  },
};
