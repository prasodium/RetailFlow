import prisma from "../../lib/prisma.js";
import { createSale } from "../sales/sale.service.js";

interface PlaceOrderInput {
  customerId?: number;

  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  paymentMethod: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";

  shippingAddress?: string;

  items: {
    productId: number;
    quantity: number;
  }[];
}

export async function placeOrder(input: PlaceOrderInput) {
  return createSale({
    ...input,
    source: "ONLINE",
  });
}

export async function getOrdersForCustomer(customerId: number) {
  return prisma.sale.findMany({
    where: {
      customerId,
      source: "ONLINE",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOrderForCustomer(id: number, customerId: number) {
  return prisma.sale.findFirst({
    where: {
      id,
      customerId,
      source: "ONLINE",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
