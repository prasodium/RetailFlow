import prisma from "../../lib/prisma.js";

export async function getInventory() {
  return prisma.inventory.findMany({
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getInventoryByProductId(productId: number) {
  return prisma.inventory.findUnique({
    where: {
      productId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function getLowStockInventory() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: true,
    },
    orderBy: {
      quantity: "asc",
    },
  });

  return inventory.filter(
    (item) => item.quantity <= item.minStock
  );
}

export async function stockIn(
  productId: number,
  quantity: number,
  note?: string
) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: {
        productId,
      },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const updatedInventory = await tx.inventory.update({
      where: {
        productId,
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        type: "STOCK_IN",
        quantity,
        ...(note !== undefined && {
          note,
        }),
        inventoryId: inventory.id,
      },
    });

    return updatedInventory;
  });
}

export async function stockOut(
  productId: number,
  quantity: number,
  note?: string
) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: {
        productId,
      },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (inventory.quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    const updatedInventory = await tx.inventory.update({
      where: {
        productId,
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        type: "STOCK_OUT",
        quantity,
        ...(note !== undefined && {
          note,
        }),
        inventoryId: inventory.id,
      },
    });

    return updatedInventory;
  });
}

export async function getInventoryStats() {
  const inventory = await prisma.inventory.findMany();

  const totalProducts = inventory.length;

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const lowStockProducts = inventory.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= item.minStock
  ).length;

  const outOfStockProducts = inventory.filter(
    (item) => item.quantity === 0
  ).length;

  return {
    totalProducts,
    totalUnits,
    lowStockProducts,
    outOfStockProducts,
  };
}