import mongoose from "mongoose";

const FilingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  month: { type: String, required: true },
  year: { type: Number, required: true },

  gross_turnover: { type: Number, default: 0 },
  total_expenses: { type: Number, default: 0 },
  tax_due: { type: Number, default: 0 },

  status: {
    type: String,
    enum: [
      "DRAFT",
      "PROCESSING",
      "REVIEWED",
      "GENERATED",
      "AUTOFILLING",
      "READY_FOR_DOWNLOAD",
      "SUBMITTED",
    ],
    default: "DRAFT",
  },

  raw_file_path: { type: String },
  kra_generated_path: { type: String },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Filing", FilingSchema);
