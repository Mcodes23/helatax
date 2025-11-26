import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // e.g., "ARCHIVE_GENERATED"

  entity_id: { type: String },
  entity_type: { type: String },

  previous_state: { type: Object },
  new_state: { type: Object },

  timestamp: { type: Date, default: Date.now, immutable: true },
});

export default mongoose.model("AuditLog", AuditLogSchema);
