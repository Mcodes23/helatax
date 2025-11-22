import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chat.js";
import taxRoutes from "./routes/tax.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/tax", taxRoutes);

app.get("/", (req, res) => {
  res.send("HelaTax Backend is Running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
