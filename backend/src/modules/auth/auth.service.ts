import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { signStaffToken, signCustomerToken } from "../../middleware/auth.middleware.js";

const SALT_ROUNDS = 10;

function sanitizeCustomer<T extends { password: string | null }>(
  customer: T
) {
  const { password, ...rest } = customer;

  return rest;
}

export async function staffLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.password);

  if (!matches) {
    throw new Error("Invalid email or password");
  }

  const token = signStaffToken({
    id: user.id,
    role: user.role,
  });

  const { password: _password, ...staff } = user;

  return {
    token,
    staff,
  };
}

interface CustomerSignupInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export async function customerSignup(input: CustomerSignupInput) {
  const existing = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existing && existing.password) {
    throw new Error("An account with this email already exists");
  }

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);

  // A passwordless row means a walk-in Customer created by a POS sale
  // used this email before — claim it instead of creating a duplicate.
  const customer = existing
    ? await prisma.customer.update({
        where: {
          id: existing.id,
        },
        data: {
          name: input.name,
          password: hashed,
          phone: input.phone ?? existing.phone,
          address: input.address ?? existing.address,
        },
      })
    : await prisma.customer.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashed,
          phone: input.phone ?? null,
          address: input.address ?? null,
        },
      });

  const token = signCustomerToken({
    id: customer.id,
  });

  return {
    token,
    customer: sanitizeCustomer(customer),
  };
}

export async function customerLogin(email: string, password: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      email,
    },
  });

  if (!customer || !customer.password) {
    throw new Error("Invalid email or password");
  }

  const matches = await bcrypt.compare(password, customer.password);

  if (!matches) {
    throw new Error("Invalid email or password");
  }

  const token = signCustomerToken({
    id: customer.id,
  });

  return {
    token,
    customer: sanitizeCustomer(customer),
  };
}
