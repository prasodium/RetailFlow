import type { Request, Response } from "express";
import {
  staffLogin,
  customerSignup,
  customerLogin,
} from "./auth.service.js";

export async function staffLoginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await staffLogin(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error?.message || "Login failed",
    });
  }
}

export async function customerSignupController(req: Request, res: Response) {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const result = await customerSignup({
      name,
      email,
      password,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error?.message || "Signup failed",
    });
  }
}

export async function customerLoginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await customerLogin(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error?.message || "Login failed",
    });
  }
}
