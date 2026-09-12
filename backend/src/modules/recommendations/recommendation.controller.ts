import type { Request, Response } from "express";
import {
  getHomeRecommendations,
  getProductRecommendations,
  getCartRecommendations,
} from "./recommendation.service.js";

export async function homeRecommendationsController(
  req: Request,
  res: Response
) {
  try {
    const products = await getHomeRecommendations(req.customer?.id);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
}

export async function productRecommendationsController(
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

    const products = await getProductRecommendations(id);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
}

export async function cartRecommendationsController(
  req: Request,
  res: Response
) {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "productIds must be an array",
      });
    }

    const ids = productIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    const products = await getCartRecommendations(ids);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
}
