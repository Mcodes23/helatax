import express from "express";
import { chatWithAi } from "./ai.controller.js";
import { protect } from "../../middleware/authMiddleware.js";
import { sanitizeInput } from "../../middleware/sanitizer.js";

const router = express.Router();

// POST /api/v1/ai/chat
router.post("/chat", protect, sanitizeInput, chatWithAi);

export default router;
