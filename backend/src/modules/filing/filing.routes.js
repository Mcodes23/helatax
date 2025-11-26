import express from "express";
import { protect } from "../../middleware/authMiddleware.js"; // We need to create this!
import { upload } from "../../middleware/uploadMiddleware.js";
import {
  uploadFiling,
  downloadFiling,
  getHistory,
} from "./filing.controller.js";

const router = express.Router();

// POST /api/v1/filing/upload
// 1. Check Token (protect) -> 2. Handle File (upload) -> 3. Logic (controller)
router.post("/upload", protect, upload.single("file"), uploadFiling);
router.get("/download/:id", protect, downloadFiling);
router.get("/history", protect, getHistory);
export default router;
