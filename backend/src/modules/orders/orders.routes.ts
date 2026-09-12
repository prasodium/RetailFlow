import { Router } from "express";
import {
  placeOrderController,
  myOrdersController,
  orderDetailController,
} from "./orders.controller.js";
import {
  optionalCustomerAuth,
  requireCustomerAuth,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", optionalCustomerAuth, placeOrderController);

router.get("/mine", requireCustomerAuth, myOrdersController);
router.get("/:id", requireCustomerAuth, orderDetailController);

export default router;
