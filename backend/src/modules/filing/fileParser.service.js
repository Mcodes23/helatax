import xlsx from "xlsx";
import logger from "../../utils/logger.js";

/**
 * Generic Parser to extract rows from an uploaded Excel/CSV file.
 * Returns an array of normalized objects: { date, description, amount, type }
 */
export const parseUserExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with headers
    const rawData = xlsx.utils.sheet_to_json(worksheet);
    const transactions = [];

    rawData.forEach((row) => {
      // Normalize keys to lowercase to avoid "Date" vs "date" issues
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        cleanRow[key.trim().toLowerCase()] = row[key];
      });

      // Extract values based on expected column names
      const dateRaw = cleanRow["date"];
      const description = cleanRow["description"] || "General Transaction";
      const amount = parseFloat(cleanRow["amount"]) || 0;
      const type = (cleanRow["type"] || "INCOME").toUpperCase();

      transactions.push({
        date: parseExcelDate(dateRaw),
        description,
        amount,
        type: type.includes("INCOME") ? "INCOME" : "EXPENSE",
      });
    });

    logger.info(`Parsed ${transactions.length} rows from Excel.`);
    return transactions;
  } catch (error) {
    logger.error(`Excel Parsing Error: ${error.message}`);
    throw new Error(
      "Failed to read the sales file. Ensure it has Date, Description, and Amount columns."
    );
  }
};

/**
 * Helper to handle Excel's weird date serial numbers (e.g. 45231)
 */
function parseExcelDate(dateVal) {
  if (!dateVal) return new Date().toISOString();

  if (typeof dateVal === "number") {
    // Convert Excel serial to JS Date
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString();
  }

  // If it's already a string, try to parse it
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}
