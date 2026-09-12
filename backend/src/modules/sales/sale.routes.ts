import { Router } from "express";

import {
  createSaleController,
  getSale,
  listSales,
} from "./sale.controller.js";

const router = Router();

router.post("/", createSaleController);

router.get("/", listSales);

router.get("/:id", getSale);

export default router;