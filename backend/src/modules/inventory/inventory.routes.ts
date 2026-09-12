import { Router } from "express";

import {
  addStock,
  getProductInventory,
  inventoryStats,
  listInventory,
  listLowStockInventory,
  removeStock,
} from "./inventory.controller.js";
import { requireStaffAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(requireStaffAuth);

router.get("/", listInventory);
router.get("/stats", inventoryStats);
router.get("/low-stock", listLowStockInventory);

router.get(
  "/product/:productId",
  getProductInventory
);

router.post(
  "/product/:productId/stock-in",
  addStock
);

router.post(
  "/product/:productId/stock-out",
  removeStock
);

export default router;