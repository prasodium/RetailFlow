import {
  ShoppingCart,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { resolveImageUrl } from "../lib/assets";
import { getProductRating } from "../lib/rating";
import { getDiscountPercent, getListPrice } from "../lib/pricing";
import StarRating from "./StarRating";

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

  const price = Number(product.price);
  const listPrice = getListPrice(price);
  const discount = getDiscountPercent(price, listPrice);
  const { rating, reviewCount } = getProductRating(product.id);

  return (
    <div className="group bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">

      {/* Product visual */}

      <Link
        to={`/products/${product.id}`}
        className="block"
      >

        <div className="h-52 bg-white flex items-center justify-center overflow-hidden p-4">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
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

      <div className="p-4 flex-1 flex flex-col">

        <p className="text-[11px] text-[#007185] font-medium uppercase tracking-wide">
          {product.category.name}
        </p>

        <Link
          to={`/products/${product.id}`}
        >
          <h3 className="font-medium text-sm mt-1 hover:text-[#c7511f] line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5">
          <StarRating rating={rating} reviewCount={reviewCount} />
        </div>

        <div className="mt-2">

          <div className="flex items-baseline gap-1.5">
            <span className="text-xs align-top">₹</span>
            <span className="text-xl font-semibold">
              {price.toLocaleString("en-IN")}
            </span>

            {discount > 0 && (
              <span className="text-xs text-green-700 font-medium">
                -{discount}%
              </span>
            )}
          </div>

          {discount > 0 && (
            <p className="text-xs text-zinc-500">
              M.R.P.:{" "}
              <span className="line-through">
                ₹{listPrice.toLocaleString("en-IN")}
              </span>
            </p>
          )}

          <p className="text-xs text-zinc-500 mt-0.5">
            {outOfStock ? (
              <span className="text-red-600 font-medium">Out of stock</span>
            ) : (
              "FREE Delivery"
            )}
          </p>

        </div>

        <button
          disabled={outOfStock}
          onClick={() =>
            onAddToCart(product)
          }
          className="mt-3 w-full flex items-center justify-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-zinc-900 text-sm font-medium py-2 rounded-full disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>

      </div>

    </div>
  );
}
