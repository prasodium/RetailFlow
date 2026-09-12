import type { UserRole } from "../generated/enums.js";

declare global {
  namespace Express {
    interface Request {
      staff?: {
        id: number;
        role: UserRole;
      };
      customer?: {
        id: number;
      };
    }
  }
}

export {};
