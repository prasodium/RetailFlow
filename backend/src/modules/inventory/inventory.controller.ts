import type { Request, Response } from "express";

import {
  getInventory,
  getInventoryByProductId,
  getInventoryStats,
  getLowStockInventory,
  stockIn,
  stockOut,
} from "./inventory.service.js";


export async function listInventory(
  _req: Request,
  res: Response
) {
  try {
    const inventory = await getInventory();

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
}

export async function getProductInventory(
  req: Request,
  res: Response
) {
  try {
    const productId = Number(req.params.productId);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const inventory = await getInventoryByProductId(productId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
}

export async function addStock(
  req: Request,
  res: Response
) {
  try {
    const productId = Number(req.params.productId);
    const { quantity, note } = req.body;

    if (
      Number.isNaN(productId) ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID and positive quantity are required",
      });
    }

    const inventory = await stockIn(
      productId,
      quantity,
      note
    );

    res.json({
      success: true,
      message: "Stock added successfully",
      data: inventory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add stock",
    });
  }
}

export async function removeStock(
  req: Request,
  res: Response
) {
  try {
    const productId = Number(req.params.productId);
    const { quantity, note } = req.body;

    if (
      Number.isNaN(productId) ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID and positive quantity are required",
      });
    }

    const inventory = await stockOut(
      productId,
      quantity,
      note
    );

    res.json({
      success: true,
      message: "Stock removed successfully",
      data: inventory,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove stock";

    const status =
      message === "Insufficient stock" ? 400 : 500;

    res.status(status).json({
      success: false,
      message,
    });
  }
}

export async function listLowStockInventory(
  _req: Request,
  res: Response
) {
  try {
    const inventory = await getLowStockInventory();

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock inventory",
    });
  }
}

export async function inventoryStats(
  _req: Request,
  res: Response
) {
  try {
    const stats = await getInventoryStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics",
    });
  }
}