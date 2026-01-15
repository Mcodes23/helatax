import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Filing from "../../models/Filing.js";
import { parseUserExcel } from "./fileParser.service.js";
import { createNotification } from "../notifications/notification.controller.js";
import logger from "../../utils/logger.js";

// ==========================================
// KRA MAPPING CONFIGURATION
// ==========================================
const KRA_FORM_MAPS = {
  TRADER: {
    // Turnover Tax (TOT) Form Logic
    sheets: {
      basic: "Basic_Info", // Matches keyword in Python
      tax: "Tax_Due", // Matches keyword in Python
    },
    cells: {
      pin: "C2",
      return_type: "C3",
      period_from: "C4",
      period_to: "C5",
      turnover: "C6", // Default for TOT
    },
  },
  PROFESSIONAL: {
    // Income Tax (IT1) Form Logic (Example Placeholder)
    sheets: {
      basic: "Basic_Info",
      tax: "Computation",
    },
    cells: {
      pin: "C2",
      return_type: "C3",
      period_from: "C4",
      period_to: "C5",
      gross_income: "F15", // Example cell for IT1
      total_expenses: "F20",
    },
  },
};

// 1. Upload Filing (Step 1 - Processing)
export const uploadFiling = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const { month, year } = req.body;
    const userTaxMode = req.user.tax_mode || "TRADER"; // Default to TRADER

    logger.info(`Processing Filing for User: ${req.user.name}`);

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
      // Normalize type check
      const type = t.type ? t.type.toUpperCase() : "INCOME";
      if (type === "INCOME") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    let estimatedTax = 0;
    if (userTaxMode === "TRADER") {
      estimatedTax = totalIncome * 0.03; // 3% Turnover Tax
    } else {
      // Professional: 30% of Profit
      estimatedTax = Math.max(0, (totalIncome - totalExpense) * 0.3);
    }

    // Update DB
    filing.gross_turnover = totalIncome;
    filing.total_expenses = totalExpense;
    filing.tax_due = estimatedTax;
    filing.status = "GENERATED";
    await filing.save();

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

// 2. Autofill KRA Template (Step 2 - The Universal Engine)
export const processAutofill = async (req, res) => {
  try {
    const { filingId, transactions } = req.body;

    // 1. Validate Inputs
    if (!req.file) throw new Error("No KRA Template uploaded");
    if (!filingId) throw new Error("Filing ID is missing");

    // 2. Fetch Filing & User Data
    const filing = await Filing.findById(filingId).populate("user");
    if (!filing) throw new Error("Filing record not found");

    const userPin = filing.user.kra_pin;
    if (!userPin || userPin.length < 10) {
      throw new Error("Invalid KRA PIN in user profile.");
    }

    logger.info(
      `Starting Universal Autofill for: ${filing.user.name} (${filing.user.tax_mode})`
    );

    // 3. Prepare Paths
    const templatePath = req.file.path;
    const jsonDataPath = path.resolve(
      process.cwd(),
      "uploads",
      `data_${filingId}.json`
    );
    const outputExcelPath = path.resolve(
      process.cwd(),
      "uploads",
      `filled_return_${filingId}.xlsm`
    );

    // 4. Calculate Dates
    const monthMap = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    const mm = monthMap[filing.month];
    const yyyy = filing.year;
    const lastDay = new Date(yyyy, parseInt(mm), 0).getDate();

    // KRA Format: DD/MM/YYYY
    const dateFrom = `01/${mm}/${yyyy}`;
    const dateTo = `${lastDay}/${mm}/${yyyy}`;

    // 5. Select Mapping Based on Mode
    const mode = filing.user.tax_mode || "TRADER";
    const map = KRA_FORM_MAPS[mode] || KRA_FORM_MAPS["TRADER"];

    // 6. Recalculate Totals (Secure Calculation on Server)
    const txns =
      typeof transactions === "string"
        ? JSON.parse(transactions)
        : transactions;
    let totalIncome = 0;
    let totalExpense = 0;

    if (txns && Array.isArray(txns)) {
      txns.forEach((t) => {
        if (t.type === "INCOME") totalIncome += parseFloat(t.amount || 0);
        else totalExpense += parseFloat(t.amount || 0);
      });
    } else {
      totalIncome = filing.gross_turnover; // Fallback to DB value
    }

    // 7. Build Instructions Payload (The "Universal" Part)
    const instructions = [];

    // --- A. Basic Info Instructions ---
    instructions.push(
      { sheet_keyword: map.sheets.basic, cell: map.cells.pin, value: userPin },
      {
        sheet_keyword: map.sheets.basic,
        cell: map.cells.return_type,
        value: "Original",
      },
      {
        sheet_keyword: map.sheets.basic,
        cell: map.cells.period_from,
        value: dateFrom,
      },
      {
        sheet_keyword: map.sheets.basic,
        cell: map.cells.period_to,
        value: dateTo,
      }
    );

    // --- B. Tax Data Instructions ---
    if (mode === "TRADER") {
      instructions.push({
        sheet_keyword: map.sheets.tax,
        cell: map.cells.turnover,
        value: totalIncome,
      });
    } else if (mode === "PROFESSIONAL") {
      // Example for IT1 form
      instructions.push(
        {
          sheet_keyword: map.sheets.tax,
          cell: map.cells.gross_income,
          value: totalIncome,
        },
        {
          sheet_keyword: map.sheets.tax,
          cell: map.cells.total_expenses,
          value: totalExpense,
        }
      );
    }

    // Write instructions to JSON
    fs.writeFileSync(jsonDataPath, JSON.stringify({ instructions }));

    // 8. Run Python
    filing.status = "AUTOFILLING";
    await filing.save();

    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const pythonScriptPath = path.resolve(
      process.cwd(),
      "python_engine",
      "main.py"
    );

    const pythonProcess = spawn(pythonCommand, [
      pythonScriptPath,
      templatePath,
      jsonDataPath,
      outputExcelPath,
    ]);

    pythonProcess.stdout.on("data", (data) =>
      logger.info(`[PY] ${data.toString().trim()}`)
    );
    pythonProcess.stderr.on("data", (data) =>
      logger.error(`[PY ERROR] ${data.toString().trim()}`)
    );

    pythonProcess.on("close", async (code) => {
      if (code === 0 && fs.existsSync(outputExcelPath)) {
        filing.kra_generated_path = outputExcelPath;
        filing.status = "READY_FOR_DOWNLOAD";
        await filing.save();

        await createNotification(
          filing.user._id,
          "Your KRA Return is ready!",
          "SUCCESS"
        );

        if (!res.headersSent) {
          res
            .status(200)
            .json({
              success: true,
              downloadUrl: `/api/v1/filing/download/${filingId}`,
            });
        }
      } else {
        if (!res.headersSent)
          res
            .status(500)
            .json({ success: false, message: "Autofill engine failed." });
      }
    });
  } catch (error) {
    logger.error(`Autofill Error: ${error.message}`);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Download File
export const downloadFiling = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);
    if (!filing) throw new Error("Filing not found");

    if (filing.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (
      !filing.kra_generated_path ||
      !fs.existsSync(filing.kra_generated_path)
    ) {
      return res
        .status(404)
        .json({ message: "File not found. Please regenerate." });
    }

    const filename = `KRA_Return_${filing.month}_${filing.year}.xlsm`;
    res.download(filing.kra_generated_path, filename);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: error.message });
  }
};

// 4. Get History
export const getHistory = async (req, res) => {
  try {
    const filings = await Filing.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: filings.length, data: filings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);
    if (!filing)
      return res
        .status(404)
        .json({ success: false, message: "Filing not found" });

    filing.status = "SUBMITTED";
    await filing.save();
    res.json({ success: true, message: "Payment confirmed", data: filing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
