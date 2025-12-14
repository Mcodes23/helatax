import fs from "fs"; // <--- NEW: To save JSON files
import path from "path"; // <--- NEW: To handle file paths
import { spawn } from "child_process"; // <--- NEW: To talk to Python
import Filing from "../../models/Filing.js";
import { parseUserExcel } from "./fileParser.service.js";
import { generateKraCsv } from "./kraGenerator.service.js"; // Keeping this for backup/legacy
import { archiveFiling } from "../compliance/archive.service.js";
import { createNotification } from "../notifications/notification.controller.js";
import logger from "../../utils/logger.js";

// 1. Upload Filing (Step 1 - Existing)
export const uploadFiling = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const { month, year } = req.body;
    const userTaxMode = req.user.tax_mode;

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
      if (t.type === "INCOME") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    let estimatedTax = 0;
    if (userTaxMode === "TRADER") {
      estimatedTax = totalIncome * 0.03;
    } else {
      estimatedTax = Math.max(0, (totalIncome - totalExpense) * 0.3);
    }

    // Generate Legacy CSV (Optional - keeping for safety)
    const kraFilePath = await generateKraCsv(
      filing._id,
      transactions,
      userTaxMode
    );

    // Update DB
    filing.gross_turnover = totalIncome;
    filing.total_expenses = totalExpense;
    filing.tax_due = estimatedTax;
    filing.kra_generated_path = kraFilePath;
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

// 2. Autofill KRA Template (Step 2 - NEW)

export const processAutofill = async (req, res) => {
  try {
    const { filingId, transactions } = req.body;

    // 1. Validation
    if (!req.file) throw new Error("No KRA Template uploaded");
    if (!filingId) throw new Error("Filing ID is missing");

    logger.info(`Starting Autofill for Filing ID: ${filingId}`);

    // 2. Paths
    const templatePath = req.file.path;
    const jsonDataPath = path.join("uploads", `data_${filingId}.json`);
    const outputExcelPath = path.join(
      "uploads",
      `filled_return_${filingId}.xlsx`
    );

    // 3. Save Data JSON
    const jsonContent =
      typeof transactions === "string"
        ? transactions
        : JSON.stringify(transactions);
    fs.writeFileSync(jsonDataPath, jsonContent);

    // 4. Update DB Status
    const filing = await Filing.findById(filingId);
    if (filing) {
      filing.status = "AUTOFILLING";
      await filing.save();
    }

    // 5. Spawn Python Process
    const pythonCommand = process.platform === "win32" ? "python" : "python3";

    logger.info(`Running Python command: ${pythonCommand}`);

    const pythonProcess = spawn(pythonCommand, [
      "python_engine/main.py",
      templatePath,
      jsonDataPath,
      outputExcelPath,
    ]);

    // --- NEW: Handle Launch Errors (e.g., Python not found) ---
    pythonProcess.on("error", (err) => {
      logger.error(`Failed to start Python process: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: `System could not start Python. Ensure '${pythonCommand}' is installed.`,
      });
    });

    // --- Handle Python Output ---
    pythonProcess.stdout.on("data", (data) => {
      logger.info(`Python: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      logger.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        logger.info("Autofill Complete!");

        if (filing) {
          filing.kra_generated_path = outputExcelPath;
          filing.status = "READY_FOR_DOWNLOAD";
          await filing.save();
        }

        await createNotification(
          req.user.id,
          `Your KRA Excel Return is ready!`,
          "SUCCESS"
        );

        // Check if we already sent a response (in case of error event)
        if (!res.headersSent) {
          return res.status(200).json({
            success: true,
            message: "Autofill successful",
            downloadUrl: `/api/v1/filing/download/${filingId}`,
          });
        }
      } else {
        logger.error(`Python script failed with code ${code}`);
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message:
              "The autofill engine encountered an error. Check server logs.",
          });
        }
      }
    });
  } catch (error) {
    logger.error(`Autofill Error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
// ---------------------------------------------------------

// 3. Download File (Updated to handle new Excel path)
export const downloadFiling = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);

    if (!filing) throw new Error("Filing not found");

    if (filing.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Check if file exists
    if (!fs.existsSync(filing.kra_generated_path)) {
      return res
        .status(404)
        .json({ message: "File generated but not found on server." });
    }

    res.download(filing.kra_generated_path);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 4. Get History
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

// 5. Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);
    if (!filing)
      return res
        .status(404)
        .json({ success: false, message: "Filing not found" });
    if (filing.user.toString() !== req.user.id)
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });

    filing.status = "SUBMITTED";
    await filing.save();

    await createNotification(
      req.user.id,
      `Payment confirmed for ${filing.month} return. Reference: ${filing._id}`,
      "SUCCESS"
    );

    res.json({ success: true, message: "Payment confirmed", data: filing });
  } catch (error) {
    logger.error(`Payment Confirmation Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
