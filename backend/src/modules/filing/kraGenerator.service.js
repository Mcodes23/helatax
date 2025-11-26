import { createObjectCsvWriter } from "csv-writer";
import path from "path";

export const generateKraCsv = async (filingId, transactions, taxMode) => {
  const outputPath = `uploads/KRA_RETURN_${filingId}.csv`;

  // Define the Headers based on Tax Mode
  let header = [];

  if (taxMode === "TRADER") {
    // Simplified TOT Header
    header = [
      { id: "date", title: "Transaction Date" },
      { id: "description", title: "Description" },
      { id: "amount", title: "Gross Turnover" },
      { id: "tax_due", title: "Tax (3%)" },
    ];
  } else {
    // Professional Header (Income Tax)
    header = [
      { id: "date", title: "Date" },
      { id: "description", title: "Service Description" },
      { id: "amount", title: "Taxable Value" },
      { id: "tax_due", title: "Estimated Tax (30%)" },
    ];
  }

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: header,
  });

  // Prepare records with Tax Calculation included
  const records = transactions.map((t) => {
    const rate = taxMode === "TRADER" ? 0.03 : 0.3; // 3% vs 30%
    const tax = t.type === "INCOME" ? (t.amount * rate).toFixed(2) : 0;

    return {
      date: t.date.toISOString().split("T")[0],
      description: t.description,
      amount: t.amount,
      tax_due: tax,
    };
  });

  await csvWriter.writeRecords(records);
  return outputPath;
};
