import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getProduct, getProductRecommendations } from "../api";
import RecommendedProducts from "../components/RecommendedProducts";
import { resolveImageUrl } from "../lib/assets";
import type { Product } from "../types";

interface ProductDetailsProps {
  onAddToCart: (
    product: Product,
    quantity?: number
  ) => void;
}

export default function ProductDetails({
  onAddToCart,
}: ProductDetailsProps) {

  const { id } = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [recommended, setRecommended] =
    useState<Product[]>([]);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    if (!id) return;

    getProduct(Number(id))
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));

    getProductRecommendations(Number(id))
      .then(setRecommended)
      .catch(console.error);

  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        Product not found.
      </div>
    );
  }

  const stock =
    product.inventory?.quantity ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 mb-8"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">

        {/* Image */}

        <div className="h-[450px] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center overflow-hidden">

          {resolveImageUrl(product.imageUrl) ? (
            <img
              src={resolveImageUrl(product.imageUrl)!}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-zinc-400 text-center">

              <div className="text-8xl font-bold">
                {product.name
                  .substring(0, 1)
                  .toUpperCase()}
              </div>

              <p className="mt-3">
                {product.sku}
              </p>

            </div>
          )}

        </div>

        {/* Details */}

        <div className="py-4">

          <p className="text-blue-600 font-medium text-sm">
            {product.category.name}
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {product.name}
          </h1>

          <p className="text-zinc-500 mt-2">
            SKU: {product.sku}
          </p>

          <p className="text-3xl font-bold mt-8">
            ₹{Number(product.price).toFixed(2)}
          </p>

          <div className="border-t border-b my-8 py-6">

            <p className="text-zinc-600 leading-7">
              {product.description ||
                "No description available."}
            </p>

          </div>

          <div className="mb-6">

            {stock > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ {stock} units available
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                Out of stock
              </p>
            )}

          </div>

          {stock > 0 && (

            <div className="flex gap-4">

              <div className="flex items-center border rounded-xl">

                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  className="p-3 hover:bg-zinc-100"
                >
                  <Minus size={18} />
                </button>

                <span className="w-12 text-center font-medium">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        stock,
                        quantity + 1
                      )
                    )
                  }
                  className="p-3 hover:bg-zinc-100"
                >
                  <Plus size={18} />
                </button>

              </div>

              <button
                onClick={() =>
                  onAddToCart(
                    product,
                    quantity
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

            </div>

          )}

        </div>

      </div>

      <RecommendedProducts
        title="You May Also Like"
        products={recommended}
        onAddToCart={onAddToCart}
      />

    </div>
  );
}