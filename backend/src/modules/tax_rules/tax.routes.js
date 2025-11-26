import express from "express";
import { addRule, getRate } from "./tax.controller.js";

const router = express.Router();

router.post("/", addRule); // POST /api/v1/tax-rules
router.get("/query", getRate); // GET /api/v1/tax-rules/query

export default router;
