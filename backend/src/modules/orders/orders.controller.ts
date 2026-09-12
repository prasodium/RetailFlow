import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import {
  placeOrder,
  getOrdersForCustomer,
  getOrderForCustomer,
} from "./orders.service.js";

export async function placeOrderController(req: Request, res: Response) {
  try {
    const { paymentMethod, items, shippingAddress, customer } = req.body;

    if (!paymentMethod || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Payment method and at least one item are required",
      });
    }

    let resolvedShippingAddress: string | undefined = shippingAddress;

    if (req.customer) {
      if (!resolvedShippingAddress) {
        const account = await prisma.customer.findUnique({
          where: { id: req.customer.id },
        });

        resolvedShippingAddress = account?.address ?? undefined;
      }

      const order = await placeOrder({
        customerId: req.customer.id,
        paymentMethod,
        items,
        ...(resolvedShippingAddress !== undefined && {
          shippingAddress: resolvedShippingAddress,
        }),
      });

      return res.status(201).json({
        success: true,
        data: order,
      });
    }

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required for guest checkout",
      });
    }

    const finalShippingAddress = resolvedShippingAddress ?? customer.address;

    const order = await placeOrder({
      customer,
      paymentMethod,
      items,
      ...(finalShippingAddress !== undefined && {
        shippingAddress: finalShippingAddress,
      }),
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to place order",
    });
  }
}

export async function myOrdersController(req: Request, res: Response) {
  try {
    const orders = await getOrdersForCustomer(req.customer!.id);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}

export async function orderDetailController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await getOrderForCustomer(id, req.customer!.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
}
