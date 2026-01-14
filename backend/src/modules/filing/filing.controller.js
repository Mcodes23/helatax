import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import fileParserService from "./fileParser.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Upload & Parse (Populates Step 2)
export const uploadFiling = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Call the parser
    const parsedData = await fileParserService.parseTraderExcel(req.file.path);

    res.status(200).json({
      message: "File processed successfully",
      data: parsedData,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to process uploaded file." });
  }
};

// 2. Generate Return (Runs Python for Step 3)
export const processAutofill = async (req, res) => {
  let tempJsonPath = null;
  try {
    if (!req.file)
      return res.status(400).json({ error: "Please upload KRA Template." });

    const userData = JSON.parse(req.body.data);
    const uniqueId = Date.now();
    tempJsonPath = path.resolve(req.file.destination, `data_${uniqueId}.json`);
    fs.writeFileSync(tempJsonPath, JSON.stringify(userData));

    const templatePath = path.resolve(req.file.path);
    const pythonScript = path.resolve(
      __dirname,
      "../../../../python_engine/main.py"
    );

    // Run Python
    const command = `python "${pythonScript}" "${templatePath}" "${tempJsonPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);

      if (error) {
        console.error("Python Error:", stderr);
        return res.status(500).json({ error: "Autofill Engine failed." });
      }

      const filename = stdout.trim().split("\n").pop().trim();

      if (!filename || filename.startsWith("ERROR")) {
        return res.status(500).json({ error: "Engine Error: " + filename });
      }

      res.status(200).json({
        message: "Return generated successfully",
        downloadUrl: `http://localhost:5000/generated/${filename}`,
      });
    });
  } catch (error) {
    if (tempJsonPath && fs.existsSync(tempJsonPath))
      fs.unlinkSync(tempJsonPath);
    res.status(500).json({ error: "Server processing failed." });
  }
};

// 3. REQUIRED EXPORTS (Prevents "SyntaxError: does not provide export")
export const confirmPayment = async (req, res) =>
  res.status(200).json({ msg: "Payment OK" });
export const downloadFiling = async (req, res) =>
  res.status(200).json({ msg: "Download OK" });
export const getHistory = async (req, res) =>
  res.status(200).json({ history: [] });
