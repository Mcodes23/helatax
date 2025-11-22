import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const router = express.Router();

// 1. Configure Multer
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// 2. THE LOGIC
router.post("/analyze", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // 3. CALCULATE TAX
    let totalIncome = 0;

    data.forEach((row) => {
      // Robust column checking (case-insensitive)
      const keys = Object.keys(row);
      const amountKey = keys.find(
        (key) =>
          key.toLowerCase().includes("amount") ||
          key.toLowerCase().includes("income")
      );

      if (amountKey) {
        totalIncome += parseFloat(row[amountKey]) || 0;
      }
    });

    // --- UPDATED TAX LOGIC (Finance Act 2023) ---
    // Rate: 1.5% on Gross Sales
    const turnoverTax = totalIncome * 0.015;

    // VAT remains 16% (if applicable)
    const vat = totalIncome * 0.16;

    // 4. CLEAN UP
    fs.unlinkSync(filePath);

    // 5. SEND RESULTS
    res.json({
      success: true,
      fileName: req.file.originalname,
      totalRows: data.length,
      totalIncome: totalIncome,
      breakdown: {
        turnoverTax: turnoverTax, // Now correctly calculated at 1.5%
        vat: vat,
        netIncome: totalIncome - turnoverTax,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing file" });
  }
});

export default router;
