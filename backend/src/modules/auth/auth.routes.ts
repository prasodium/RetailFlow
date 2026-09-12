import { Router } from "express";
import {
  staffLoginController,
  customerSignupController,
  customerLoginController,
} from "./auth.controller.js";

const router = Router();

router.post("/staff/login", staffLoginController);

router.post("/customer/signup", customerSignupController);
router.post("/customer/login", customerLoginController);

export default router;
