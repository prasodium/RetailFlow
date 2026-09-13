import { Router } from "express";

import {
  createCustomerController,
  customerSales,
  deleteCustomerController,
  getCustomer,
  listCustomers,
  recentlyViewedController,
  updateCustomerController,
} from "./customer.controller.js";
import {
  requireCustomerAuth,
  requireStaffAuth,
} from "../../middleware/auth.middleware.js";

const router = Router();

// Customer-facing self-service route — must be registered before the
// staff-only gate below, since that `router.use` applies to everything
// after it.
router.get("/me/recently-viewed", requireCustomerAuth, recentlyViewedController);

router.use(requireStaffAuth);

router.post("/", createCustomerController);

router.get("/", listCustomers);

router.get("/:id/sales", customerSales);

router.get("/:id", getCustomer);

router.put("/:id", updateCustomerController);

router.delete("/:id", deleteCustomerController);

export default router;