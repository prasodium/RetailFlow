import { Router } from "express";

import {
  addProduct,
  getProduct,
  listProducts,
  updateProductController,
  deleteProductController,
} from "./product.controller.js";

const router = Router();

router.get("/", listProducts);

router.get("/:id", getProduct);

router.post("/", addProduct);

router.put("/:id", updateProductController);

router.delete("/:id", deleteProductController);

export default router;