import fs from "fs";
import path from "path";
import AuditLog from "./auditLog.model.js";
import logger from "../../utils/logger.js";

const VAULT_DIR = "vault/";

// Ensure Vault exists
if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR);
}

export const archiveFiling = async (userId, filingId, filePath) => {
  try {
    // 1. Define Secure Path (Year/Month/File)
    const date = new Date();
    const secureName = `AUDIT_${userId}_${filingId}_${
      date.toISOString().split("T")[0]
    }.bak`;
    const destPath = path.join(VAULT_DIR, secureName);

    // 2. Copy file to Vault (Simulating "Write Once" storage)
    fs.copyFileSync(filePath, destPath);

    // 3. Log the Event
    await AuditLog.create({
      user: userId,
      action: "ARCHIVE_GENERATED",
      entity_id: filingId,
      entity_type: "Filing",
      new_state: { vault_location: destPath },
    });

    logger.info(`🔒 Secured Filing ${filingId} to Vault.`);
    return destPath;
  } catch (error) {
    logger.error(`Vault Error: ${error.message}`);
    throw new Error("Archiving failed. Compliance risk.");
  }
};
