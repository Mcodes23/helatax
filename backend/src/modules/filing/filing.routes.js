// backend/src/modules/filing/filing.routes.js

import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/uploadMiddleware.js";
import {
  uploadFiling,
  downloadFiling,
  getHistory,
  confirmPayment, // <--- 1. Import this
} from "./filing.controller.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadFiling);
router.get("/download/:id", protect, downloadFiling);
router.get("/history", protect, getHistory);
router.put("/pay/:id", protect, confirmPayment); // <--- 2. Add this route

export default router;
