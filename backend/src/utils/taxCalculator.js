const toRate = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const TAX_RATES = {
  TRADER: toRate(process.env.TOT_RATE, 0.03),
  PROFESSIONAL: toRate(process.env.CORP_TAX_RATE, 0.3),
};

export const calculateTaxDue = ({ taxMode, totalIncome, totalExpense }) => {
  if (taxMode === "TRADER") {
    return totalIncome * TAX_RATES.TRADER;
  }

  const taxableIncome = Math.max(0, totalIncome - totalExpense);
  return taxableIncome * TAX_RATES.PROFESSIONAL;
};

export const calculateTransactionTax = (taxMode, transaction) => {
  const rate =
    taxMode === "TRADER" ? TAX_RATES.TRADER : TAX_RATES.PROFESSIONAL;
  return transaction.type === "INCOME"
    ? Number((transaction.amount * rate).toFixed(2))
    : 0;
};
