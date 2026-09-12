import prisma from "../../lib/prisma.js";

interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomerById(id: number) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      sales: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });
}

export async function createCustomer(
  input: CreateCustomerInput
) {
  return prisma.customer.create({
    data: {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });
}

export async function updateCustomer(
  id: number,
  input: UpdateCustomerInput
) {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.email !== undefined) {
    data.email = input.email || null;
  }

  if (input.phone !== undefined) {
    data.phone = input.phone || null;
  }

  if (input.address !== undefined) {
    data.address = input.address || null;
  }

  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteCustomer(id: number) {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const salesCount = await prisma.sale.count({
    where: {
      customerId: id,
    },
  });

  if (salesCount > 0) {
    throw new Error(
      "Cannot delete customer with existing sales"
    );
  }

  return prisma.customer.delete({
    where: {
      id,
    },
  });
}

export async function getCustomerSales(
  customerId: number
) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.sale.findMany({
    where: {
      customerId,
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