import xlsx from "xlsx";
import fs from "fs";
import logger from "../../utils/logger.js";

// Helper: parse a messy date like "12/11/23" or Excel Serial Date
const parseDate = (excelDate) => {
  if (!excelDate) return new Date();
  // If number (Excel serial date)
  if (typeof excelDate === "number") {
    return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  }
  // If string
  return new Date(excelDate);
};

export const parseUserExcel = async (filePath) => {
  try {
    // 1. Read the file from disk
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assume data is in first sheet
    const sheet = workbook.Sheets[sheetName];

    // 2. Convert to JSON
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // 3. Normalize Data (Map "Cost" or "Price" to "Amount")
    const transactions = rawData.map((row) => {
      // Look for common column names users might use
      const amount =
        row["Amount"] || row["Cost"] || row["Price"] || row["Value"] || 0;
      const description =
        row["Description"] || row["Item"] || row["Details"] || "Unknown";
      const date = parseDate(row["Date"] || row["Day"]);
      const type = row["Type"] ? row["Type"].toUpperCase() : "EXPENSE"; // Default to Expense if missing

      return {
        date,
        description,
        amount: parseFloat(amount),
        type:
          type.includes("SALE") || type.includes("INCOME")
            ? "INCOME"
            : "EXPENSE",
      };
    });

    logger.info(`Parsed ${transactions.length} rows from Excel.`);
    return transactions;
  } catch (error) {
    logger.error(`Parsing Error: ${error.message}`);
    throw new Error(
      "Failed to read Excel file. Ensure it has columns: Date, Description, Amount."
    );
  }
};
