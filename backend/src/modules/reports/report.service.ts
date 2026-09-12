import prisma from "../../lib/prisma.js";

export async function getSalesSummary() {
  const sales = await prisma.sale.findMany({
    where: {
      status: "COMPLETED",
    },
    select: {
      total: true,
      subtotal: true,
      discount: true,
      tax: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSales = sales.length;

  const revenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total),
    0
  );

  const subtotal = sales.reduce(
    (sum, sale) => sum + Number(sale.subtotal),
    0
  );

  const discount = sales.reduce(
    (sum, sale) => sum + Number(sale.discount),
    0
  );

  const tax = sales.reduce(
    (sum, sale) => sum + Number(sale.tax),
    0
  );

  return {
    totalSales,
    revenue,
    subtotal,
    discount,
    tax,
  };
}

export async function getTopProducts() {
  const items = await prisma.saleItem.findMany({
    include: {
      product: true,
      sale: {
        select: {
          status: true,
        },
      },
    },
  });

  const productMap = new Map<
    number,
    {
      productId: number;
      name: string;
      sku: string;
      quantity: number;
      revenue: number;
    }
  >();

  for (const item of items) {
    if (item.sale.status !== "COMPLETED") {
      continue;
    }

    const existing = productMap.get(item.productId);

    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += Number(item.subtotal);
    } else {
      productMap.set(item.productId, {
        productId: item.productId,
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        revenue: Number(item.subtotal),
      });
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
}

export async function getPaymentSummary() {
  const sales = await prisma.sale.findMany({
    where: {
      status: "COMPLETED",
    },
    select: {
      paymentMethod: true,
      total: true,
    },
  });

  const paymentMap = new Map<
    string,
    {
      paymentMethod: string;
      sales: number;
      revenue: number;
    }
  >();

  for (const sale of sales) {
    const existing = paymentMap.get(
      sale.paymentMethod
    );

    if (existing) {
      existing.sales += 1;
      existing.revenue += Number(sale.total);
    } else {
      paymentMap.set(sale.paymentMethod, {
        paymentMethod: sale.paymentMethod,
        sales: 1,
        revenue: Number(sale.total),
      });
    }
  }

  return Array.from(paymentMap.values());
}

export async function getProfitSummary() {
  const items = await prisma.saleItem.findMany({
    include: {
      product: true,
      sale: {
        select: {
          status: true,
        },
      },
    },
  });

  let revenue = 0;
  let cost = 0;

  for (const item of items) {
    if (item.sale.status !== "COMPLETED") {
      continue;
    }

    revenue += Number(item.subtotal);

    cost +=
      Number(item.product.costPrice) *
      item.quantity;
  }

  return {
    revenue,
    cost,
    profit: revenue - cost,
  };
}