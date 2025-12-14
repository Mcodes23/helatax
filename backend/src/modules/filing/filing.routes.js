import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/uploadMiddleware.js";
import {
  uploadFiling,
  processAutofill,
  downloadFiling,
  getHistory,
  confirmPayment,
} from "./filing.controller.js";

const router = express.Router();

// Step 1: Upload Raw Sales
router.post("/upload", protect, upload.single("file"), uploadFiling);

// Step 3: Upload Template & Autofill (The New Route)
router.post("/autofill", protect, upload.single("file"), processAutofill);

router.get("/download/:id", protect, downloadFiling);
router.get("/history", protect, getHistory);
router.put("/pay/:id", protect, confirmPayment);

export default router;
