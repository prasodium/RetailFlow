import type { Request, Response } from "express";
import {
  recordEvents,
  getFunnel,
  getSummaryMetrics,
  getSearchAnalytics,
  getActionRequired,
} from "./analytics.service.js";

function parseDays(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 365) : 30;
}

export async function recordEventsController(req: Request, res: Response) {
  try {
    const body = Array.isArray(req.body) ? req.body : [req.body];

    const events = body
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        eventType: e.eventType,
        sessionId: e.sessionId,
        ...(e.productId !== undefined &&
          e.productId !== null && { productId: Number(e.productId) }),
        ...(typeof e.device === "string" && { device: e.device }),
        ...(e.metadata &&
          typeof e.metadata === "object" && { metadata: e.metadata }),
        ...(req.customer && { customerId: req.customer.id }),
      }));

    const result = await recordEvents(events);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Analytics ingestion must never surface as a hard failure to the
    // client — log and acknowledge so a tracking bug can't break the app.
    console.error("Failed to record analytics events:", error);

    res.status(200).json({
      success: true,
      data: { count: 0 },
    });
  }
}

export async function funnelController(req: Request, res: Response) {
  try {
    const days = parseDays(req.query.days);

    const stages = await getFunnel(days);

    res.json({
      success: true,
      data: { days, stages },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch funnel",
    });
  }
}

export async function summaryController(req: Request, res: Response) {
  try {
    const days = parseDays(req.query.days);

    const summary = await getSummaryMetrics(days);

    res.json({
      success: true,
      data: { days, ...summary },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
    });
  }
}

export async function searchAnalyticsController(req: Request, res: Response) {
  try {
    const days = parseDays(req.query.days);

    const search = await getSearchAnalytics(days);

    res.json({
      success: true,
      data: { days, ...search },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch search analytics",
    });
  }
}

export async function actionRequiredController(req: Request, res: Response) {
  try {
    const days = parseDays(req.query.days);

    const data = await getActionRequired(days);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch action-required items",
    });
  }
}
