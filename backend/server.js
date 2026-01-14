import dotenv from "dotenv";
import express from "express"; // <--- ADDED THIS
import path from "path"; // <--- ADDED THIS
import { fileURLToPath } from "url";
import http from "http";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import logger from "./src/utils/logger.js";
import { startCronJobs } from "./src/services/cron.service.js";

dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();
startCronJobs();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Serve the generated files so frontend can download them
app.use("/generated", express.static(path.join(__dirname, "generated")));

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
