import cron from "node-cron";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js"; // Imports the file we just made
import logger from "../utils/logger.js";

const checkDeadlines = async () => {
  const today = new Date();
  const day = today.getDate(); // Returns 1-31

  logger.info(`⏰ Cron Job Running. Today is Day ${day}`);

  // 1. THE 9TH: PAYE / SHIF / HOUSING LEVY
  if (day === 9) {
    const pros = await User.find({ tax_mode: "PROFESSIONAL" });
    logger.info(`Sending PAYE Reminders to ${pros.length} users...`);

    pros.forEach((user) => {
      sendEmail({
        to: user.email,
        subject: "🚨 KRA Deadline: PAYE & Levies due TODAY",
        text: `Hi ${user.name}, today is the 9th. Please remit your PAYE, SHIF, and Housing Levy.`,
      });
    });
  }

  // 2. THE 20TH: TURNOVER TAX / VAT
  if (day === 20) {
    const traders = await User.find({
      $or: [{ tax_mode: "TRADER" }, { "obligations.is_vat_registered": true }],
    });

    logger.info(`Sending TOT/VAT Reminders to ${traders.length} users...`);

    traders.forEach((user) => {
      sendEmail({
        to: user.email,
        subject: "KRA Deadline: Turnover Tax / VAT due TODAY",
        text: `Hi ${user.name}, today is the 20th. Please file your Turnover Tax/VAT Returns.`,
      });
    });
  }
};

export const startCronJobs = () => {
  // Schedule to run every day at 08:00 AM
  cron.schedule("0 8 * * *", () => {
    checkDeadlines();
  });

  logger.info("✅ Statutory Deadline Scheduler Initialized");
};
