import TaxRule from "../../models/TaxRule.js";

// 1. New Tax Rule
export const createRule = async (ruleData) => {
  return await TaxRule.create(ruleData);
};

// 2. The Time Travel Logic
export const getRuleForDate = async (code, dateString) => {
  const queryDate = dateString ? new Date(dateString) : new Date();

  const rule = await TaxRule.findOne({
    code: code,
    valid_from: { $lte: queryDate },
    valid_to: { $gte: queryDate },
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

// 3. All Rules
export const getAllRules = async () => {
  return await TaxRule.find().sort({ valid_from: -1 });
};
