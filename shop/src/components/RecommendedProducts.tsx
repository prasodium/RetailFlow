import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "../types";

interface RecommendedProductsProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function RecommendedProducts({
  title,
  products,
  onAddToCart,
}: RecommendedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={18} className="text-blue-600" />

        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
