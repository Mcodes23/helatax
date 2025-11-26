import TaxRule from "../../models/TaxRule.js";

// 1. Create a New Tax Rule (Admin/Seeding)
export const createRule = async (ruleData) => {
  return await TaxRule.create(ruleData);
};

// 2. The Time Travel Logic
// Finds a rule that was active on a specific date
export const getRuleForDate = async (code, dateString) => {
  const queryDate = dateString ? new Date(dateString) : new Date();

  const rule = await TaxRule.findOne({
    code: code,
    valid_from: { $lte: queryDate }, // Rule started BEFORE query date
    valid_to: { $gte: queryDate }, // Rule ends AFTER query date
  });

  if (!rule) {
    throw new Error(
      `No active tax rule found for ${code} on ${
        queryDate.toISOString().split("T")[0]
      }`
    );
  }

  return rule;
};

// 3. Get All Rules (For Debugging)
export const getAllRules = async () => {
  return await TaxRule.find().sort({ valid_from: -1 });
};
