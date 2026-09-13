import type { Request, Response } from "express";

import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomerSales,
  getCustomers,
  getRecentlyViewedProducts,
  updateCustomer,
} from "./customer.service.js";

export async function recentlyViewedController(
  req: Request,
  res: Response
) {
  try {
    const products = await getRecentlyViewedProducts(req.customer!.id);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recently viewed products",
    });
  }
}

export async function createCustomerController(
  req: Request,
  res: Response
) {
  try {
    const customer = await createCustomer(req.body);

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create customer",
    });
  }
}

export async function listCustomers(
  _req: Request,
  res: Response
) {
  try {
    const customers = await getCustomers();

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}

export async function getCustomer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
}

export async function updateCustomerController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await updateCustomer(
      id,
      req.body
    );

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update customer",
    });
  }
}

export async function deleteCustomerController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    await deleteCustomer(id);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete customer",
    });
  }
}

export async function customerSales(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const sales = await getCustomerSales(id);

    res.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer sales",
    });
  }
}