import type { Request, Response } from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
} from "./category.service.js";

export async function listCategories(
  _req: Request,
  res: Response
) {
  try {
    const categories = await getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
}

export async function getCategory(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Failed to fetch category:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
}

export async function addCategory(
  req: Request,
  res: Response
) {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await createCategory({
      name: name.trim(),
      description,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Failed to create category:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
}