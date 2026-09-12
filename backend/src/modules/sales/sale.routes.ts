import { Router } from "express";

import {
  createSaleController,
  getSale,
  listSales,
  updateOrderStatusController,
} from "./sale.controller.js";
import { requireStaffAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireStaffAuth);

router.post("/", createSaleController);

router.get("/", listSales);

router.get("/:id", getSale);

router.patch("/:id/order-status", updateOrderStatusController);

export default router;