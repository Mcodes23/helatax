// Run this with: node test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load your secrets manually to be sure
dotenv.config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is missing in server/.env");
  process.exit(1);
}

console.log("🔑 Testing API Key: " + apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

// We will try the specific stable model name for free tier
const modelName = "gemini-2.0-flash";

async function run() {
  try {
    console.log(`🤖 Connecting to model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent("Explain tax in 5 words.");
    const response = await result.response;
    const text = response.text();

    console.log("\n✅ SUCCESS! The API works.");
    console.log("🤖 AI Response:", text);
  } catch (error) {
    console.error("\n❌ FAILED.");
    console.error("Error Message:", error.message);

    if (error.message.includes("404")) {
      console.log(
        "\n💡 TIP: A 404 error usually means the API Key is valid, but it does not have access to the Generative Language API."
      );
      console.log(
        "1. Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
      );
      console.log("2. Select your project.");
      console.log("3. Click 'ENABLE'.");
    }
  }
}

run();
