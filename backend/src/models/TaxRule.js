import mongoose from "mongoose";

const TaxRuleSchema = new mongoose.Schema({
  // Unique Identifier (e.g., "HOUSING_LEVY", "TURNOVER_TAX")
  code: { type: String, required: true, index: true },
  name: { type: String, required: true }, // e.g., "Affordable Housing Levy"

  // The Math
  rate: { type: Number, required: true }, // e.g., 0.015 (1.5%)
  is_deductible: { type: Boolean, default: false }, // If true, subtract from Gross before Tax (Like SHIF/Housing in 2025)

  // THE TIME TRAVEL FIELDS
  valid_from: { type: Date, required: true }, // e.g., 2024-01-01
  valid_to: { type: Date, default: "2099-12-31" }, // e.g., 2024-12-31

  // Metadata for AI
  description: { type: String },
  legal_reference: { type: String }, // e.g., "Finance Act 2023 Sec 12C"
});

// Static Method: Find the correct rate for a specific date
TaxRuleSchema.statics.findRuleForDate = function (code, date) {
  return this.findOne({
    code: code,
    valid_from: { $lte: date }, // Rule started BEFORE query date
    valid_to: { $gte: date }, // Rule ends AFTER query date
  });
};

export default mongoose.model("TaxRule", TaxRuleSchema);
