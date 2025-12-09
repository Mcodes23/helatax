import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getNotifications, markAsRead } from "./notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);

export default router;
