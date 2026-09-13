import type { Request, Response } from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  updateProductImage,
  recordProductView,
  deleteProduct,
} from "./product.service.js";
import { getBestSellingProducts } from "../recommendations/recommendation.service.js";

export async function popularProducts(
  req: Request,
  res: Response
) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const products = await getBestSellingProducts(limit);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch popular products",
    });
  }
}

export async function listProducts(
  _req: Request,
  res: Response
) {
  try {
    const products = await getProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export async function getProduct(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (req.customer) {
      recordProductView(req.customer.id, id).catch(console.error);
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

export async function uploadProductImage(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "An image file is required",
      });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    const product = await updateProductImage(id, imageUrl);

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error?.message || "Failed to upload image",
    });
  }
}

export async function addProduct(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      sku,
      description,
      price,
      costPrice,
      categoryId,
    } = req.body;

    if (
      !name ||
      !sku ||
      price === undefined ||
      costPrice === undefined ||
      !categoryId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required product fields",
      });
    }

    const product = await createProduct({
      name,
      sku,
      description,
      price: Number(price),
      costPrice: Number(costPrice),
      categoryId: Number(categoryId),
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
}

export async function updateProductController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const {
      name,
      sku,
      description,
      price,
      costPrice,
      categoryId,
    } = req.body;

    if (
      !name ||
      !sku ||
      price === undefined ||
      costPrice === undefined ||
      !categoryId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required product fields",
      });
    }

    const product = await updateProduct(id, {
      name,
      sku,
      description,
      price: Number(price),
      costPrice: Number(costPrice),
      categoryId: Number(categoryId),
    });

    return res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to update product",
    });
  }
}

export async function deleteProductController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    await deleteProduct(id);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to delete product",
    });
  }
}