import xlsx from "xlsx";
import logger from "../../utils/logger.js";

const parseTraderExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = xlsx.utils.sheet_to_json(worksheet);

    const purchases = [];
    let totalTurnover = 0;

    rawData.forEach((row) => {
      // Normalize keys to lowercase
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        cleanRow[key.trim().toLowerCase()] = row[key];
      });

      // Extract based on your file: Date, Description, Amount, Type
      const type = cleanRow["type"] || "EXPENSE";
      const amount = parseFloat(cleanRow["amount"]) || 0;
      const desc = cleanRow["description"] || "General Goods";
      const dateRaw = cleanRow["date"];

      // Logic: INCOME adds to Turnover, EXPENSE adds to Table
      if (type.toString().toUpperCase().includes("INCOME")) {
        totalTurnover += amount;
      } else {
        purchases.push({
          supplierPin: "P051123456Z", // Dummy PIN required by KRA
          supplierName: desc, // Use desc as name
          invoiceDate: parseExcelDate(dateRaw),
          invoiceNo: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
          description: desc,
          amount: amount,
        });
      }
    });

    return {
      turnover: totalTurnover,
      purchases: purchases,
      taxDue: totalTurnover * 0.03,
    };
  } catch (error) {
    logger.error(`Parsing Error: ${error.message}`);
    throw new Error("Failed to parse trader file");
  }
};

function parseExcelDate(dateVal) {
  if (!dateVal) return "01/01/2024";
  if (typeof dateVal === "number") {
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toLocaleDateString("en-GB");
  }
  return String(dateVal);
}

export default { parseTraderExcel };
