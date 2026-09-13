import { Router } from "express";
import {
  recordEventsController,
  funnelController,
  summaryController,
  searchAnalyticsController,
  actionRequiredController,
} from "./analytics.controller.js";
import {
  optionalCustomerAuth,
  requireStaffAuth,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/events", optionalCustomerAuth, recordEventsController);

router.get("/funnel", requireStaffAuth, funnelController);
router.get("/summary", requireStaffAuth, summaryController);
router.get("/search", requireStaffAuth, searchAnalyticsController);
router.get("/action-required", requireStaffAuth, actionRequiredController);

export default router;
