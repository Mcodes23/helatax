import cron from "node-cron";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import logger from "../utils/logger.js";

const checkDeadlines = async () => {
  const today = new Date();
  const day = today.getDate();

  logger.info(`Cron Job Running. Today is Day ${day}`);

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
  cron.schedule("0 8 * * *", () => {
    checkDeadlines();
  });

  logger.info("✅ Statutory Deadline Scheduler Initialized");
};
