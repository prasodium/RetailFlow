import { Router } from "express";

import {
  paymentSummary,
  profitSummary,
  salesSummary,
  topProducts,
} from "./report.controller.js";

const router = Router();

router.get("/sales-summary", salesSummary);
router.get("/top-products", topProducts);
router.get("/payments", paymentSummary);
router.get("/profit", profitSummary);

export default router;