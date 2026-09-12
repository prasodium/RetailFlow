import { Router } from "express";

import {
  addProduct,
  getProduct,
  listProducts,
  updateProductController,
  deleteProductController,
  uploadProductImage,
} from "./product.controller.js";
import {
  requireStaffAuth,
  optionalCustomerAuth,
} from "../../middleware/auth.middleware.js";
import { productImageUpload } from "../../middleware/upload.middleware.js";

const router = Router();

router.get("/", listProducts);

router.get("/:id", optionalCustomerAuth, getProduct);

router.post("/", requireStaffAuth, addProduct);

router.put("/:id", requireStaffAuth, updateProductController);

router.delete("/:id", requireStaffAuth, deleteProductController);

router.post(
  "/:id/image",
  requireStaffAuth,
  productImageUpload,
  uploadProductImage
);

export default router;