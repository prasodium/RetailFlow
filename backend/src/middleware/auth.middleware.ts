import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../generated/enums.js";

const STAFF_SECRET = process.env.JWT_STAFF_SECRET;
const CUSTOMER_SECRET = process.env.JWT_CUSTOMER_SECRET;

if (!STAFF_SECRET) {
  throw new Error("JWT_STAFF_SECRET is not set");
}

if (!CUSTOMER_SECRET) {
  throw new Error("JWT_CUSTOMER_SECRET is not set");
}

interface StaffTokenPayload {
  id: number;
  role: UserRole;
}

interface CustomerTokenPayload {
  id: number;
}

export function signStaffToken(staff: StaffTokenPayload) {
  return jwt.sign(staff, STAFF_SECRET!, { expiresIn: "7d" });
}

export function signCustomerToken(customer: CustomerTokenPayload) {
  return jwt.sign(customer, CUSTOMER_SECRET!, { expiresIn: "30d" });
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

export function requireStaffAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const payload = jwt.verify(token, STAFF_SECRET!) as StaffTokenPayload;

    req.staff = {
      id: payload.id,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
}

export function optionalCustomerAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, CUSTOMER_SECRET!) as CustomerTokenPayload;

    req.customer = {
      id: payload.id,
    };
  } catch {
    // Invalid/expired token on an optional route: proceed as a guest.
  }

  next();
}

export function requireCustomerAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to continue",
    });
  }

  try {
    const payload = jwt.verify(token, CUSTOMER_SECRET!) as CustomerTokenPayload;

    req.customer = {
      id: payload.id,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Please sign in again",
    });
  }
}
