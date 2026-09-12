import type { Request, Response } from "express";

import {
  createSale,
  getSaleById,
  getSales,
} from "./sale.service.js";

export async function createSaleController(
  req: Request,
  res: Response
) {
  try {
    const sale = await createSale(req.body);

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create sale",
    });
  }
}

export async function listSales(
  _req: Request,
  res: Response
) {
  try {
    const sales = await getSales();

    res.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
    });
  }
}

export async function getSale(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    const sale = await getSaleById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
    });
  }
}