import mongoose from "mongoose";
import dotenv from "dotenv";
import TaxRule from "../models/TaxRule.js";

// Load environment variables
dotenv.config({ path: "../../.env" });

const seedData = [
  // --- FINANCE ACT 2023 (Current Rules) ---
  {
    code: "TURNOVER_TAX",
    name: "Turnover Tax (2023)",
    rate: 0.03, // 3%
    valid_from: new Date("2023-07-01"),
    valid_to: new Date("2099-12-31"),
    description: "3% on Gross Sales (Finance Act 2023)",
    legal_reference: "Sec 12C",
  },
  {
    code: "INCOME_TAX_PRO",
    name: "Professional Income Tax",
    rate: 0.3, // 30% Estimate
    valid_from: new Date("2023-07-01"),
    valid_to: new Date("2099-12-31"),
    description: "30% on Net Profit",
    legal_reference: "Head B",
  },
  // --- OLD LAWS (For Time Travel Testing) ---
  {
    code: "TURNOVER_TAX",
    name: "Old Turnover Tax",
    rate: 0.01, // Was 1% before July 2023
    valid_from: new Date("2020-01-01"),
    valid_to: new Date("2023-06-30"),
    description: "1% on Gross Sales (Expired)",
    legal_reference: "Finance Act 2020",
  },
];

const seedDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongoDB Connected");

    // Clear old data
    await TaxRule.deleteMany({});
    console.log("Cleared old tax rules");

    // Insert new data
    await TaxRule.insertMany(seedData);
    console.log("Tax Rules Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedDB();
