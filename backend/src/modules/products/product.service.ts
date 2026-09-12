import prisma from "../../lib/prisma.js";

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      inventory: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      inventory: true,
    },
  });
}

export async function createProduct(data: {
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: number;
}) {
  return prisma.product.create({
  data: {
    name: data.name,
    sku: data.sku,
    ...(data.description !== undefined && {
      description: data.description,
    }),
    price: data.price,
    costPrice: data.costPrice,
    categoryId: data.categoryId,
    inventory: {
      create: {
        quantity: 0,
        minStock: 10,
      },
    },
  },
    include: {
      category: true,
      inventory: true,
    },
  });
}

export async function updateProduct(
  id: number,
  input: {
    name: string;
    sku: string;
    description?: string;
    price: number;
    costPrice: number;
    categoryId: number;
  }
) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      sku: input.sku,
      description: input.description ?? null,
      price: input.price,
      costPrice: input.costPrice,
      categoryId: input.categoryId,
    },
    include: {
      category: true,
      inventory: true,
    },
  });
}
export async function updateProductImage(id: number, imageUrl: string) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      imageUrl,
    },
    include: {
      category: true,
      inventory: true,
    },
  });
}

export async function recordProductView(
  customerId: number,
  productId: number
) {
  return prisma.productView.upsert({
    where: {
      customerId_productId: {
        customerId,
        productId,
      },
    },
    update: {
      viewCount: {
        increment: 1,
      },
    },
    create: {
      customerId,
      productId,
    },
  });
}

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      inventory: true,
      saleItems: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.saleItems.length > 0) {
    throw new Error(
      "Cannot delete a product that has sales history. Archive it instead."
    );
  }

  return prisma.$transaction(async (tx) => {
    if (product.inventory) {
      await tx.inventoryTransaction.deleteMany({
        where: {
          inventoryId: product.inventory.id,
        },
      });

      await tx.inventory.delete({
        where: {
          id: product.inventory.id,
        },
      });
    }

    return tx.product.delete({
      where: {
        id,
      },
    });
  });
}