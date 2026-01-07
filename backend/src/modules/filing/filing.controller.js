import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Filing from "../../models/Filing.js";
import { parseUserExcel } from "./fileParser.service.js";
import { generateKraCsv } from "./kraGenerator.service.js";
import { archiveFiling } from "../compliance/archive.service.js";
import { createNotification } from "../notifications/notification.controller.js";
import logger from "../../utils/logger.js";

// 1. Upload Filing (Step 1 - Processing)
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
      estimatedTax = totalIncome * 0.03; // 3% Turnover Tax
    } else {
      estimatedTax = Math.max(0, (totalIncome - totalExpense) * 0.3); // 30% Income Tax
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

// 2. Autofill KRA Template (Step 2 - The Python Engine)
export const processAutofill = async (req, res) => {
  try {
    const { filingId, transactions } = req.body;

    // 1. Validate Inputs
    if (!req.file) throw new Error("No KRA Template uploaded");
    if (!filingId) throw new Error("Filing ID is missing");

    // 2. Fetch Filing & POPULATE User Data
    const filing = await Filing.findById(filingId).populate("user");

    if (!filing) throw new Error("Filing record not found");

    // 🟢 FIX: Use 'kra_pin' (with underscore) to match your MongoDB Schema
    const userPin = filing.user.kra_pin;

    // Validation Log
    logger.info(`Checking PIN for User ${filing.user.name}: ${userPin}`);

    if (!userPin || userPin.length < 10) {
      throw new Error(
        `Your Profile is missing a valid KRA PIN. Found: '${userPin}'. Please go to Settings and update it first.`
      );
    }

    logger.info(
      `🚀 Starting Autofill for User: ${filing.user.name} (${userPin})`
    );

    // 3. Prepare Paths (Save as .xlsm to preserve macros)
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

    // 4. Calculate Dynamic Dates
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
    // Calculate the last day of the specific month
    const lastDay = new Date(yyyy, parseInt(mm), 0).getDate();

    // 5. Build the Payload (REAL DATA ONLY)
    const payload = {
      transactions:
        typeof transactions === "string"
          ? JSON.parse(transactions)
          : transactions,
      meta: {
        pin: userPin, // <--- Now uses the Correct variable
        returnType: "Original",
        returnPeriodFrom: `01/${mm}/${yyyy}`, // Updated key to match Python script expectation if needed, or kept as periodFrom
        periodFrom: `01/${mm}/${yyyy}`,
        periodTo: `${lastDay}/${mm}/${yyyy}`,
      },
    };

    fs.writeFileSync(jsonDataPath, JSON.stringify(payload));

    // 6. Update Status
    filing.status = "AUTOFILLING";
    await filing.save();

    // 7. Run Python (Using Virtual Environment to fix ModuleNotFoundError)
    // ------------------------------------------------------------------
    let pythonCommand = "python"; // fallback
    const pythonScriptPath = path.resolve(
      process.cwd(),
      "python_engine",
      "main.py"
    );

    if (process.platform === "win32") {
      // Windows: Check for .venv/Scripts/python.exe
      const venvPython = path.join(
        process.cwd(),
        ".venv",
        "Scripts",
        "python.exe"
      );
      if (fs.existsSync(venvPython)) {
        pythonCommand = venvPython;
        logger.info(`🐍 Using Virtual Env Python: ${pythonCommand}`);
      } else {
        logger.warn(
          `⚠️ Virtual Env not found at ${venvPython}, using global python`
        );
      }
    } else {
      // Linux/Mac: Check for .venv/bin/python
      const venvPython = path.join(process.cwd(), ".venv", "bin", "python");
      if (fs.existsSync(venvPython)) {
        pythonCommand = venvPython;
      } else {
        pythonCommand = "python3";
      }
    }

    const pythonProcess = spawn(
      pythonCommand,
      [pythonScriptPath, templatePath, jsonDataPath, outputExcelPath],
      {
        cwd: process.cwd(), // Ensure working directory is correct
      }
    );

    // Handle Python Logs
    pythonProcess.stdout.on("data", (data) =>
      logger.info(`🐍 ${data.toString().trim()}`)
    );
    pythonProcess.stderr.on("data", (data) =>
      logger.error(`🐍 Error: ${data.toString().trim()}`)
    );

    // Handle Completion
    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        // Verify the file was actually created
        if (!fs.existsSync(outputExcelPath)) {
          logger.error(
            `Python script completed but file not found: ${outputExcelPath}`
          );
          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              message: "Autofill completed but output file was not created.",
            });
          }
          return;
        }

        filing.kra_generated_path = outputExcelPath;
        filing.status = "READY_FOR_DOWNLOAD";
        await filing.save();

        await createNotification(
          filing.user._id,
          "Your KRA Return is ready!",
          "SUCCESS"
        );

        if (!res.headersSent) {
          return res.status(200).json({
            success: true,
            downloadUrl: `/api/v1/filing/download/${filingId}`,
          });
        }
      } else {
        if (!res.headersSent)
          return res
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

    if (!filing.kra_generated_path) {
      logger.error(`Filing ${filing._id} has no kra_generated_path`);
      return res.status(404).json({
        message: "File path not set. Please regenerate the filing.",
      });
    }

    // Resolve to absolute path (handles both relative and absolute paths)
    const filePath = path.isAbsolute(filing.kra_generated_path)
      ? filing.kra_generated_path
      : path.resolve(process.cwd(), filing.kra_generated_path);

    logger.info(`Download request for filing ${filing._id}, path: ${filePath}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`File not found: ${filePath}`);
      return res.status(404).json({
        message: `File generated but not found on server. Path: ${filePath}`,
      });
    }

    // Set proper filename for download
    const filename = `KRA_Return_${filing.month}_${filing.year}.xlsm`;

    res.download(filePath, filename, (err) => {
      if (err) {
        logger.error(`Download error for filing ${filing._id}: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({
            message: `Download failed: ${err.message}`,
          });
        }
      }
    });
  } catch (error) {
    logger.error(`Download endpoint error: ${error.message}`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
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
