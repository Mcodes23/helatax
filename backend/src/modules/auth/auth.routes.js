import express from "express";
import { register, login, updateTaxMode } from "./auth.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/update-mode", protect, updateTaxMode);

export default router;
