import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { track } from "../lib/analytics";
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
  const signature = products.map((p) => p.id).join(",");
  const trackedSignature = useRef<string | null>(null);

  useEffect(() => {
    if (!signature || trackedSignature.current === signature) {
      return;
    }

    trackedSignature.current = signature;

    track("recommendation_viewed", {
      metadata: { section: title, count: products.length },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={18} className="text-[#c7511f]" />

        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={(e) => {
              // Only count a genuine click-through to the product page —
              // not clicking "Add to Cart" within the card.
              if ((e.target as HTMLElement).closest("a")) {
                track("recommendation_clicked", {
                  productId: product.id,
                  metadata: { section: title },
                });
              }
            }}
          >
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}
