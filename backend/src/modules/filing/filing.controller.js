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

    if (!req.file) throw new Error("No KRA Template uploaded");
    if (!filingId) throw new Error("Filing ID is missing");

    // 1. Fetch Filing & User Details to get PIN
    const filing = await Filing.findById(filingId).populate("user");
    if (!filing) throw new Error("Filing not found");

    logger.info(`🚀 Starting Autofill for User: ${filing.user.name}`);

    // 2. Prepare Paths (⚠️ Save as .xlsm to keep Macros)
    const templatePath = req.file.path;
    const jsonDataPath = path.join("uploads", `data_${filingId}.json`);
    const outputExcelPath = path.join(
      "uploads",
      `filled_return_${filingId}.xlsm`
    );

    // 3. Calculate Dates & Prepare Data Payload
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
    const lastDay = new Date(yyyy, parseInt(mm), 0).getDate(); // Auto-calculate last day (28, 30, or 31)

    // Construct the FULL data packet
    const payload = {
      transactions:
        typeof transactions === "string"
          ? JSON.parse(transactions)
          : transactions,
      meta: {
        pin: filing.user.krapin || "A000000000Z", // Fallback PIN
        returnType: "Original",
        periodFrom: `01/${mm}/${yyyy}`,
        periodTo: `${lastDay}/${mm}/${yyyy}`,
      },
    };

    // Save payload to JSON
    fs.writeFileSync(jsonDataPath, JSON.stringify(payload));

    // 4. Update Status
    filing.status = "AUTOFILLING";
    await filing.save();

    // 5. Spawn Python
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const pythonProcess = spawn(pythonCommand, [
      "python_engine/main.py",
      templatePath,
      jsonDataPath,
      outputExcelPath,
    ]);

    // Handle Output
    pythonProcess.stdout.on("data", (data) =>
      logger.info(`${data.toString().trim()}`)
    );
    pythonProcess.stderr.on("data", (data) =>
      logger.error(`Error: ${data.toString().trim()}`)
    );

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        logger.info("Autofill Complete!");

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
