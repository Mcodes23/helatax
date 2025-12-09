import mongoose from "mongoose";

const TaxRuleSchema = new mongoose.Schema({
  code: { type: String, required: true, index: true },
  name: { type: String, required: true },

  // The Math
  rate: { type: Number, required: true },
  is_deductible: { type: Boolean, default: false },

  // THE TIME TRAVEL FIELDS
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, default: "2099-12-31" },

  // Metadata for AI
  description: { type: String },
  legal_reference: { type: String },
});

TaxRuleSchema.statics.findRuleForDate = function (code, date) {
  return this.findOne({
    code: code,
    valid_from: { $lte: date },
    valid_to: { $gte: date },
  });
};

export default mongoose.model("TaxRule", TaxRuleSchema);
