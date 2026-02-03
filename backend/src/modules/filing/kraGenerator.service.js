import { createObjectCsvWriter } from "csv-writer";
import { calculateTransactionTax } from "../../utils/taxCalculator.js";

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

  const records = transactions.map((t) => {
    const tax = calculateTransactionTax(taxMode, t);

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
