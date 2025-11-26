import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import logger from "./src/utils/logger.js";
import { startCronJobs } from "./src/services/cron.service.js";

connectDB();

startCronJobs();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
