import { Router } from "express";
import {
  homeRecommendationsController,
  productRecommendationsController,
  cartRecommendationsController,
} from "./recommendation.controller.js";
import { optionalCustomerAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/home", optionalCustomerAuth, homeRecommendationsController);
router.get("/product/:id", productRecommendationsController);
router.post("/cart", cartRecommendationsController);

export default router;
