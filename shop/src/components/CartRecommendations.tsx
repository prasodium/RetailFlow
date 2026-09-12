import { useEffect, useState } from "react";
import { getCartRecommendations } from "../api";
import RecommendedProducts from "./RecommendedProducts";
import type { CartItem, Product } from "../types";

interface CartRecommendationsProps {
  cart: CartItem[];
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function CartRecommendations({
  cart,
  onAddToCart,
}: CartRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  // Key the fetch on the set of product ids in the cart, not the cart
  // array itself, so quantity +/- clicks don't refire the request.
  const signature = [...new Set(cart.map((item) => item.product.id))]
    .sort()
    .join(",");

  useEffect(() => {
    if (!signature) {
      return;
    }

    getCartRecommendations(
      signature.split(",").map(Number)
    )
      .then(setProducts)
      .catch(console.error);
  }, [signature]);

  if (!signature) {
    return null;
  }

  return (
    <RecommendedProducts
      title="Frequently Bought Together"
      products={products}
      onAddToCart={onAddToCart}
    />
  );
}
