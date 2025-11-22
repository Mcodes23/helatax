import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kraPin: { type: String, default: "" },
    businessType: {
      type: String,
      enum: ["Individual", "Small Business", "Freelancer"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
