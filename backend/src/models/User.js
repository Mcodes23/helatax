import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  kra_pin: { type: String, required: true, unique: true },

  profession: { type: String, required: true },
  tax_mode: {
    type: String,
    enum: ["TRADER", "PROFESSIONAL"],
    required: true,
  },

  has_confirmed_details: { type: Boolean, default: false },
  obligations: {
    is_vat_registered: { type: Boolean, default: false },
    has_mortgage: { type: Boolean, default: false },
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
