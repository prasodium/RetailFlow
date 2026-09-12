import type { Request, Response } from "express";

import {
  getPaymentSummary,
  getProfitSummary,
  getSalesSummary,
  getTopProducts,
} from "./report.service.js";

export async function salesSummary(
  _req: Request,
  res: Response
) {
  try {
    const data = await getSalesSummary();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales summary",
    });
  }
}

export async function topProducts(
  _req: Request,
  res: Response
) {
  try {
    const data = await getTopProducts();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
}

export async function paymentSummary(
  _req: Request,
  res: Response
) {
  try {
    const data = await getPaymentSummary();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payment summary",
    });
  }
}

export async function profitSummary(
  _req: Request,
  res: Response
) {
  try {
    const data = await getProfitSummary();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profit summary",
    });
  }
}