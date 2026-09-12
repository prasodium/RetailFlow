import prisma from "../../lib/prisma.js";

interface SaleItemInput {
  productId: number;
  quantity: number;
}

interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CreateSaleInput {
  customerId?: number;

  customer?: CustomerInput;

  paymentMethod:
    | "CASH"
    | "CARD"
    | "UPI"
    | "BANK_TRANSFER";

  discount?: number;
  tax?: number;

  source?: "POS" | "ONLINE";
  shippingAddress?: string;

  items: SaleItemInput[];
}

export type OrderStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const ORDER_STATUS_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function generateInvoiceNumber() {
  const timestamp = Date.now();

  return `INV-${timestamp}`;
}

export async function createSale(input: CreateSaleInput) {
  return prisma.$transaction(async (tx) => {
    if (!input.items || input.items.length === 0) {
      throw new Error("Sale must contain at least one item");
    }

    // Check customer if provided
    let customerId = input.customerId;

    if (customerId !== undefined) {
      const customer = await tx.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }
    }

    if (input.customer) {
      if (!input.customer.name.trim()) {
        throw new Error("Customer name is required");
      }

      const customer = await tx.customer.create({
        data: {
          name: input.customer.name.trim(),
          email:
            input.customer.email?.trim() || null,
          phone:
            input.customer.phone?.trim() || null,
          address:
            input.customer.address?.trim() || null,
        },
      });

      customerId = customer.id;
    }

    let subtotal = 0;

    const saleItems = [];

    // Validate products and calculate subtotal
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
        include: {
          inventory: true,
        },
      });

      if (!product) {
        throw new Error(
          `Product ${item.productId} not found`
        );
      }

      if (!product.inventory) {
        throw new Error(
          `Inventory not found for ${product.name}`
        );
      }

      if (product.inventory.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}`
        );
      }

      const unitPrice = Number(product.price);
      const itemSubtotal = unitPrice * item.quantity;

      subtotal += itemSubtotal;

      saleItems.push({
        product,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    const discount = input.discount ?? 0;
    const tax = input.tax ?? 0;

    if (discount < 0 || tax < 0) {
      throw new Error(
        "Discount and tax cannot be negative"
      );
    }

    if (discount > subtotal) {
      throw new Error(
        "Discount cannot be greater than subtotal"
      );
    }

    const total = subtotal - discount + tax;

    const source = input.source ?? "POS";
    const orderStatus: OrderStatusValue =
      source === "ONLINE" ? "PENDING" : "DELIVERED";

    const sale = await tx.sale.create({
        data: {
        invoiceNumber: generateInvoiceNumber(),

        ...(customerId !== undefined && {
          customerId,
        }),

        subtotal,
        discount,
        tax,
        total,

        paymentMethod: input.paymentMethod,

        source,
        orderStatus,
        shippingAddress: input.shippingAddress ?? null,

        items: {
            create: saleItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            })),
        },
        },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Reduce inventory and create stock transactions
    for (const item of saleItems) {
      const inventory = item.product.inventory!;

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          type: "STOCK_OUT",
          quantity: item.quantity,
          note: `Sale ${sale.invoiceNumber}`,
          inventoryId: inventory.id,
        },
      });
    }

    return sale;
  });
}
export async function getSales(filter?: { source?: "POS" | "ONLINE" }) {
  return prisma.sale.findMany({
    where: {
      ...(filter?.source && { source: filter.source }),
    },
    include: {
      customer: true,
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

export async function updateOrderStatus(
  id: number,
  newStatus: OrderStatusValue
) {
  const sale = await prisma.sale.findUnique({
    where: {
      id,
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  if (sale.source !== "ONLINE") {
    throw new Error("Only online orders have a fulfillment status");
  }

  const currentStatus = (sale.orderStatus ?? "PENDING") as OrderStatusValue;
  const allowed = ORDER_STATUS_TRANSITIONS[currentStatus];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot move an order from ${currentStatus} to ${newStatus}`
    );
  }

  return prisma.sale.update({
    where: {
      id,
    },
    data: {
      orderStatus: newStatus,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
export async function getSaleById(id: number) {
  return prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}