import nodemailer from "nodemailer";
import logger from "./logger.js";

// Create a test account (automagically) for development
let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  // In Production, you would put your real SMTP settings in .env
  // For Dev, we use Ethereal (Fake Email)
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const mailer = await createTransporter();

    const info = await mailer.sendMail({
      from: '"HelaTax Bot" <alerts@helatax.com>',
      to: to,
      subject: subject,
      text: text,
      html: `<b>${text}</b>`, // Simple HTML version
    });

    logger.info(`📧 Email sent: ${info.messageId}`);
    // Preview only available when using Ethereal account
    logger.info(`🔎 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return true;
  } catch (error) {
    logger.error(`Email Error: ${error.message}`);
    return false;
  }
};
