import {
  ShoppingCart,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { resolveImageUrl } from "../lib/assets";

interface ProductCardProps {
  product: Product;
  onAddToCart: (
    product: Product
  ) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {

  const stock =
    product.inventory?.quantity ?? 0;

  const outOfStock = stock <= 0;
  const imageUrl = resolveImageUrl(product.imageUrl);

  return (
    <div className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg transition">

      {/* Product visual */}

      <Link
        to={`/products/${product.id}`}
        className="block"
      >

        <div className="h-52 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center overflow-hidden">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <Package
              size={70}
              strokeWidth={1}
              className="text-zinc-400 group-hover:scale-110 transition"
            />
          )}

        </div>

      </Link>

      <div className="p-5">

        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
          {product.category.name}
        </p>

        <Link
          to={`/products/${product.id}`}
        >
          <h3 className="font-semibold text-lg mt-1 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-zinc-500 mt-1">
          {product.sku}
        </p>

        <div className="flex items-center justify-between mt-5">

          <div>

            <p className="text-xl font-bold">
              ₹{Number(product.price).toFixed(2)}
            </p>

            {outOfStock ? (
              <p className="text-xs text-red-600 mt-1">
                Out of stock
              </p>
            ) : (
              <p className="text-xs text-zinc-500 mt-1">
                {stock} available
              </p>
            )}

          </div>

          <button
            disabled={outOfStock}
            onClick={() =>
              onAddToCart(product)
            }
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition"
          >
            <ShoppingCart size={19} />
          </button>

        </div>

      </div>

    </div>
  );
}