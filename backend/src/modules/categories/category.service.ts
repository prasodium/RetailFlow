import prisma from "../../lib/prisma.js";

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: true,
    },
  });
}

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  return prisma.category.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
  });
}