import Filing from "../../models/Filing.js";
import { parseUserExcel } from "./fileParser.service.js";
import { generateKraCsv } from "./kraGenerator.service.js";
import { archiveFiling } from "../compliance/archive.service.js"; // Ensure this import exists
import logger from "../../utils/logger.js";

export const uploadFiling = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const { month, year } = req.body;
    const userTaxMode = req.user.tax_mode;

    // 1. Create Initial Record
    const filing = await Filing.create({
      user: req.user.id,
      month,
      year,
      status: "PROCESSING",
      raw_file_path: req.file.path,
    });

    // 2. PARSE: Read the uploaded Excel
    const transactions = await parseUserExcel(req.file.path);

    // 3. CALCULATE TOTALS
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

    // 4. GENERATE: Create the KRA CSV
    const kraFilePath = await generateKraCsv(
      filing._id,
      transactions,
      userTaxMode
    );

    // 5. ARCHIVE (Compliance)
    await archiveFiling(req.user.id, filing._id, req.file.path);

    // 6. UPDATE DB
    filing.gross_turnover = totalIncome;
    filing.total_expenses = totalExpense;
    filing.tax_due = estimatedTax;
    filing.kra_generated_path = kraFilePath;
    filing.status = "GENERATED";
    await filing.save();

    logger.info(`Filing Processed: User ${req.user.id} owes ${estimatedTax}`);

    // 7. SEND RESPONSE (CRITICAL FIX: Include parsedData!)
    res.status(201).json({
      success: true,
      message: "File processed successfully",
      filingId: filing._id, // Send ID directly
      parsedData: transactions, // <--- SEND THE ROWS BACK!
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

// @desc    Download KRA CSV
// @route   GET /api/v1/filing/download/:id
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

// @desc    Get User's Filing History
// @route   GET /api/v1/filing/history
export const getHistory = async (req, res) => {
  try {
    const filings = await Filing.find({ user: req.user.id }).sort({
      createdAt: -1,
    }); // Newest first

    res.json({
      success: true,
      count: filings.length,
      data: filings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
