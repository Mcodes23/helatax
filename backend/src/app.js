import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./utils/logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import taxRoutes from "./modules/tax_rules/tax.routes.js";
import filingRoutes from "./modules/filing/filing.routes.js";
import aiRoutes from "./modules/ai_advisor/ai.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js"; // <--- 1. Import

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "HelaTax Core API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tax-rules", taxRoutes);
app.use("/api/v1/filing", filingRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
