import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processAutofill = async (req, res) => {
  let tempJsonPath = null;

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Please upload the KRA Excel Template." });
    }

    // 1. Prepare Data
    const userData = JSON.parse(req.body.data);
    const uniqueId = Date.now();
    tempJsonPath = path.resolve(req.file.destination, `data_${uniqueId}.json`);
    fs.writeFileSync(tempJsonPath, JSON.stringify(userData));

    // 2. Prepare Paths
    const templatePath = path.resolve(req.file.path);
    const pythonScript = path.resolve(
      __dirname,
      "../../../../python_engine/main.py"
    );

    // 3. Run Engine
    exec(
      `python3 "${pythonScript}" "${templatePath}" "${tempJsonPath}"`,
      (error, stdout, stderr) => {
        // Clean up temp data
        if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);

        // Log what happened (stderr shows the logs now)
        if (stderr) console.log(`[Python Logs]:\n${stderr}`);

        if (error) {
          console.error("Execution Error:", error);
          return res
            .status(500)
            .json({ error: "Autofill Engine failed to run." });
        }

        // --- THE CRITICAL FIX ---
        // We take the LAST line of stdout to ignore any previous logs
        const rawOutput = stdout.trim();
        const generatedFilename = rawOutput.split("\n").pop().trim();

        if (!generatedFilename || generatedFilename.startsWith("ERROR")) {
          return res
            .status(500)
            .json({ error: generatedFilename || "Unknown Python Error" });
        }

        // Success
        return res.status(200).json({
          message: "Return generated successfully",
          // Make sure your server.js is serving '/generated' static folder
          downloadUrl: `http://localhost:5000/generated/${generatedFilename}`,
        });
      }
    );
  } catch (error) {
    if (tempJsonPath && fs.existsSync(tempJsonPath))
      fs.unlinkSync(tempJsonPath);
    console.error("Controller Crash:", error);
    return res.status(500).json({ error: "Server processing failed." });
  }
};

// ... keep your other exports ...
export const uploadFiling = async (req, res) => {
  res.json({ msg: "TODO" });
};
export const downloadFiling = async (req, res) => {
  res.json({ msg: "TODO" });
};
export const getHistory = async (req, res) => {
  res.json({ msg: "TODO" });
};
export const confirmPayment = async (req, res) => {
  res.json({ msg: "TODO" });
};
