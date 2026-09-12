import { Router } from "express";

import {
  paymentSummary,
  profitSummary,
  salesSummary,
  topProducts,
} from "./report.controller.js";
import { requireStaffAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireStaffAuth);

router.get("/sales-summary", salesSummary);
router.get("/top-products", topProducts);
router.get("/payments", paymentSummary);
router.get("/profit", profitSummary);

export default router;