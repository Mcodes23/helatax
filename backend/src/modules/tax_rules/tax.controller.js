import * as taxService from "./tax.service.js";
import logger from "../../utils/logger.js";

// @desc    Create a new tax rule (Seeding)
// @route   POST /api/v1/tax-rules
export const addRule = async (req, res) => {
  try {
    const rule = await taxService.createRule(req.body);
    logger.info(`New Tax Rule Added: ${rule.name} (${rule.rate})`);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    logger.error(`Add Rule Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get a rule for a specific date
// @route   GET /api/v1/tax-rules/query?code=TURNOVER_TAX&date=2023-01-01
export const getRate = async (req, res) => {
  try {
    const { code, date } = req.query;

    if (!code) {
      throw new Error("Please provide a tax code (e.g., TURNOVER_TAX)");
    }

    const rule = await taxService.getRuleForDate(code, date);

    res.json({
      success: true,
      data: {
        name: rule.name,
        rate: rule.rate,
        effective_date: date || "Today",
        source_law: rule.legal_reference,
      },
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
