import Filing from "../../models/Filing.js";
import { parseUserExcel } from "./fileParser.service.js";
import { generateKraCsv } from "./kraGenerator.service.js";
import { archiveFiling } from "../compliance/archive.service.js";
import logger from "../../utils/logger.js";

// 1. Upload Filing
export const uploadFiling = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const { month, year } = req.body;
    const userTaxMode = req.user.tax_mode;

    // Create Initial Record
    const filing = await Filing.create({
      user: req.user.id,
      month,
      year,
      status: "PROCESSING",
      raw_file_path: req.file.path,
    });

    // Parse Excel
    const transactions = await parseUserExcel(req.file.path);

    // Calculate Totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "INCOME") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    let estimatedTax = 0;
    if (userTaxMode === "TRADER") {
      estimatedTax = totalIncome * 0.03;
    } else {
      estimatedTax = Math.max(0, (totalIncome - totalExpense) * 0.3);
    }

    // Generate CSV
    const kraFilePath = await generateKraCsv(
      filing._id,
      transactions,
      userTaxMode
    );

    // Archive to Vault
    await archiveFiling(req.user.id, filing._id, req.file.path);

    // Update DB
    filing.gross_turnover = totalIncome;
    filing.total_expenses = totalExpense;
    filing.tax_due = estimatedTax;
    filing.kra_generated_path = kraFilePath;
    filing.status = "GENERATED";
    await filing.save();

    logger.info(`Filing Processed: User ${req.user.id} owes ${estimatedTax}`);

    res.status(201).json({
      success: true,
      message: "File processed successfully",
      filingId: filing._id,
      parsedData: transactions,
      taxSummary: {
        income: totalIncome,
        expense: totalExpense,
        tax: estimatedTax,
      },
    });
  } catch (error) {
    logger.error(`Processing Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. Download KRA CSV (This was likely missing or cut off)
export const downloadFiling = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);

    if (!filing) throw new Error("Filing not found");

    // Ensure user owns this filing
    if (filing.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.download(filing.kra_generated_path);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get History (This allows the history page to load)
export const getHistory = async (req, res) => {
  try {
    const filings = await Filing.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: filings.length,
      data: filings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// backend/src/modules/filing/filing.controller.js

// ... existing code ...

// @desc    Mark filing as Paid/Submitted (Simulated)
// @route   PUT /api/v1/filing/pay/:id
export const confirmPayment = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);

    if (!filing) {
      return res
        .status(404)
        .json({ success: false, message: "Filing not found" });
    }

    // Ensure user owns this filing
    if (filing.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Update Status
    filing.status = "SUBMITTED";
    await filing.save();

    logger.info(
      `Filing ${filing._id} marked as SUBMITTED by user ${req.user.id}`
    );

    res.json({ success: true, message: "Payment confirmed", data: filing });
  } catch (error) {
    logger.error(`Payment Confirmation Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
