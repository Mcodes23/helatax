import express from "express";
import { register, login, updateTaxMode } from "./auth.controller.js"; // <--- Import it here
import { protect } from "../../middleware/authMiddleware.js"; // <--- Import Middleware

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/update-mode", protect, updateTaxMode); // <--- Add this line

export default router;
