import { Router } from "express";

import {
  createCustomerController,
  customerSales,
  deleteCustomerController,
  getCustomer,
  listCustomers,
  updateCustomerController,
} from "./customer.controller.js";

const router = Router();

router.post("/", createCustomerController);

router.get("/", listCustomers);

router.get("/:id/sales", customerSales);

router.get("/:id", getCustomer);

router.put("/:id", updateCustomerController);

router.delete("/:id", deleteCustomerController);

export default router;