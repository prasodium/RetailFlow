import type { Request, Response } from "express";

import {
  createSale,
  getSaleById,
  getSales,
  updateOrderStatus,
  type OrderStatusValue,
} from "./sale.service.js";
import { recordEvents } from "../analytics/analytics.service.js";

const VALID_ORDER_STATUSES: OrderStatusValue[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function createSaleController(
  req: Request,
  res: Response
) {
  try {
    // POS sales are always staff-created in-store sales — the source is
    // never taken from the request body.
    const sale = await createSale({
      ...req.body,
      source: "POS",
    });

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
  req: Request,
  res: Response
) {
  try {
    const source = req.query.source;

    const sales = await getSales({
      ...((source === "POS" || source === "ONLINE") && { source }),
    });

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

export async function updateOrderStatusController(
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

    const { orderStatus } = req.body;

    if (!VALID_ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const sale = await updateOrderStatus(id, orderStatus);

    if (orderStatus === "CANCELLED") {
      // Fire-and-forget: staff-initiated, so there's no browser session —
      // use a synthetic per-staff session id instead.
      recordEvents([
        {
          eventType: "order_cancelled",
          sessionId: `staff-${req.staff!.id}`,
          ...(sale.customerId !== null && { customerId: sale.customerId }),
          metadata: { saleId: sale.id, invoiceNumber: sale.invoiceNumber },
        },
      ]).catch((error) => console.error("Failed to record order_cancelled:", error));
    }

    res.json({
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
          : "Failed to update order status",
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