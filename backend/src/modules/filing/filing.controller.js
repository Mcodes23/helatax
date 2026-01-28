import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Filing from "../../models/Filing.js";
import { parseUserExcel } from "./fileParser.service.js"; // Ensure this matches your parser export
import { createNotification } from "../notifications/notification.controller.js";
import logger from "../../utils/logger.js";

// ==========================================
// KRA MAPPING CONFIGURATION (From Your Test)
// ==========================================
const KRA_FORM_MAPS = {
  TRADER: {
    sheets: {
      basic: "A_Basic_Info",
      purchases: "B_Details_of_Purchases",
      tax: "D_Tax_Due",
    },
    cells: {
      pin: "B3",
      return_type: "B4",
      period_from: "B5",
      period_to: "B6",
      turnover: "C4",
    },
  },
  PROFESSIONAL: {
    sheets: {
      basic: "A_Basic_Info",
      tax: "Computation",
    },
    cells: {
      pin: "B3",
      return_type: "B4",
      period_from: "B5",
      period_to: "B6",
      gross_income: "F15",
      total_expenses: "F20",
    },
  },
};

// Helper: Format date to DD/MM/YYYY
const formatKraDate = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// 1. Upload Filing (Step 1)
export const uploadFiling = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    const { month, year } = req.body;
    const userTaxMode = req.user.tax_mode || "TRADER";

    logger.info(`Processing Filing for User: ${req.user.name}`);
    const filing = await Filing.create({
      user: req.user.id,
      month,
      year,
      status: "PROCESSING",
      raw_file_path: req.file.path,
    });

    const transactions = await parseUserExcel(req.file.path);
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "INCOME") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    filing.gross_turnover = totalIncome;
    filing.total_expenses = totalExpense;
    filing.tax_due =
      userTaxMode === "TRADER"
        ? totalIncome * 0.03
        : Math.max(0, (totalIncome - totalExpense) * 0.3);
    filing.status = "GENERATED";
    await filing.save();

    res
      .status(201)
      .json({ success: true, filingId: filing._id, parsedData: transactions });
  } catch (error) {
    logger.error(`Upload Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. Autofill Engine (Step 2)
export const processAutofill = async (req, res) => {
  try {
    const { filingId, transactions } = req.body;
    if (!req.file || !filingId) throw new Error("Missing template or ID");

    const filing = await Filing.findById(filingId).populate("user");
    const mode = filing.user.tax_mode || "TRADER";
    const map = KRA_FORM_MAPS[mode] || KRA_FORM_MAPS["TRADER"];

    const templatePath = req.file.path;
    const jsonDataPath = path.resolve(
      process.cwd(),
      "uploads",
      `data_${filingId}.json`
    );
    const outputExcelPath = path.resolve(
      process.cwd(),
      "uploads",
      `filled_${filingId}.xlsm`
    );

    // Prepare Header Dates
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = monthNames.indexOf(filing.month);
    const dateFrom = `01/${String(monthIndex + 1).padStart(2, "0")}/${
      filing.year
    }`;
    const lastDay = new Date(filing.year, monthIndex + 1, 0).getDate();
    const dateTo = `${lastDay}/${String(monthIndex + 1).padStart(2, "0")}/${
      filing.year
    }`;

    const instructions = [
      {
        sheet_keyword: map.sheets.basic,
        cell: map.cells.pin,
        value: filing.user.kra_pin,
      },
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
      },
    ];

    const txns =
      typeof transactions === "string"
        ? JSON.parse(transactions)
        : transactions;
    if (txns && Array.isArray(txns) && mode === "TRADER") {
      let expenseRow = 3;
      txns.forEach((t) => {
        if (t.type === "EXPENSE") {
          instructions.push(
            {
              sheet_keyword: map.sheets.purchases,
              cell: `A${expenseRow}`,
              value: "P000000000P",
            },
            {
              sheet_keyword: map.sheets.purchases,
              cell: `B${expenseRow}`,
              value: t.description,
            },
            {
              sheet_keyword: map.sheets.purchases,
              cell: `C${expenseRow}`,
              value: formatKraDate(t.date),
            },
            {
              sheet_keyword: map.sheets.purchases,
              cell: `D${expenseRow}`,
              value: "INV-AUTO",
            },
            {
              sheet_keyword: map.sheets.purchases,
              cell: `E${expenseRow}`,
              value: t.description,
            },
            {
              sheet_keyword: map.sheets.purchases,
              cell: `F${expenseRow}`,
              value: t.amount,
            }
          );
          expenseRow++;
        }
      });
    }

    instructions.push({
      sheet_keyword: map.sheets.tax,
      cell: map.cells.turnover,
      value: filing.gross_turnover,
    });

    fs.writeFileSync(jsonDataPath, JSON.stringify({ instructions }));
    const pythonProcess = spawn(
      process.platform === "win32" ? "python" : "python3",
      [
        path.resolve(process.cwd(), "python_engine", "main.py"),
        templatePath,
        jsonDataPath,
        outputExcelPath,
      ]
    );

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        filing.kra_generated_path = outputExcelPath;
        filing.status = "READY_FOR_DOWNLOAD";
        await filing.save();
        res
          .status(200)
          .json({
            success: true,
            downloadUrl: `/api/v1/filing/download/${filingId}`,
          });
      } else {
        res.status(500).json({ success: false, message: "Autofill failed." });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Download File
export const downloadFiling = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);
    if (!filing || filing.user.toString() !== req.user.id)
      return res.status(401).send("Unauthorized");
    res.download(filing.kra_generated_path);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// 4. Get History
export const getHistory = async (req, res) => {
  try {
    const filings = await Filing.find({ user: req.user.id }).sort("-createdAt");
    res.json({ success: true, data: filings });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 5. Confirm Payment (FIXES THE CRASH)
export const confirmPayment = async (req, res) => {
  try {
    const filing = await Filing.findById(req.params.id);
    if (!filing)
      return res
        .status(404)
        .json({ success: false, message: "Filing not found" });
    filing.status = "SUBMITTED";
    await filing.save();
    res.json({ success: true, message: "Payment confirmed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
