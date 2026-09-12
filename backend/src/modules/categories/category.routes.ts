import { Router } from "express";

import {
  addCategory,
  getCategory,
  listCategories,
} from "./category.controller.js";
import { requireStaffAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", requireStaffAuth, addCategory);

export default router;