import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // The KRA PIN is sensitive PII
  kra_pin: { type: String, required: true, unique: true },

  // THE TRIAGE LOGIC (Gatekeeper)
  // We force them to be either a TRADER (3%) or PROFESSIONAL (30%)
  profession: { type: String, required: true }, // e.g., "Doctor", "Shopkeeper"
  tax_mode: {
    type: String,
    enum: ["TRADER", "PROFESSIONAL"],
    required: true,
  },

  has_confirmed_details: { type: Boolean, default: false },
  // Obligation Flags (For the Dashboard UI)
  obligations: {
    is_vat_registered: { type: Boolean, default: false },
    has_mortgage: { type: Boolean, default: false }, // Enables Interest Relief logic
  },

  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper to check password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
