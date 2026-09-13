import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getProduct, getProductRecommendations } from "../api";
import RecommendedProducts from "../components/RecommendedProducts";
import StarRating from "../components/StarRating";
import { resolveImageUrl } from "../lib/assets";
import { getProductRating } from "../lib/rating";
import { getDiscountPercent, getListPrice } from "../lib/pricing";
import { track } from "../lib/analytics";
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
  const navigate = useNavigate();

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
      .then((data) => {
        setProduct(data);
        setQuantity(1);
        track("product_viewed", { productId: data.id });
      })
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

  const imageUrl = resolveImageUrl(product.imageUrl);
  const price = Number(product.price);
  const listPrice = getListPrice(price);
  const discount = getDiscountPercent(price, listPrice);
  const { rating, reviewCount } = getProductRating(product.id);

  const aboutItems = (product.description || "No description available.")
    .split(/[.•\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  function handleBuyNow() {
    onAddToCart(product!, quantity);
    navigate("/checkout");
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#c7511f] mb-6"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* Image */}

        <div className="lg:col-span-5">
          <div className="h-[420px] bg-white border border-zinc-200 rounded-lg flex items-center justify-center overflow-hidden p-8 sticky top-24">

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
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
        </div>

        {/* Details */}

        <div className="lg:col-span-4">

          <h1 className="text-2xl font-medium">
            {product.name}
          </h1>

          <div className="mt-2">
            <StarRating rating={rating} reviewCount={reviewCount} />
          </div>

          <p className="text-xs text-[#007185] mt-1">
            {product.category.name}
          </p>

          <div className="border-t border-zinc-200 my-4" />

          <div>
            <div className="flex items-baseline gap-1.5">
              {discount > 0 && (
                <span className="text-red-700 text-lg font-medium mr-2">
                  -{discount}%
                </span>
              )}

              <span className="text-sm align-top">₹</span>
              <span className="text-3xl font-medium">
                {price.toLocaleString("en-IN")}
              </span>
            </div>

            {discount > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                M.R.P.:{" "}
                <span className="line-through">
                  ₹{listPrice.toLocaleString("en-IN")}
                </span>
              </p>
            )}

            <p className="text-xs text-zinc-500 mt-0.5">
              Inclusive of all taxes
            </p>
          </div>

          <div className="border-t border-zinc-200 my-4" />

          <div>
            <h2 className="font-semibold text-sm mb-2">
              About this item
            </h2>

            <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-700">
              {aboutItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}

              <li>SKU: {product.sku}</li>
            </ul>
          </div>

        </div>

        {/* Buy box */}

        <div className="lg:col-span-3">
          <div className="border border-zinc-200 rounded-lg p-5 sticky top-24">

            <div className="flex items-baseline gap-1">
              <span className="text-sm align-top">₹</span>
              <span className="text-2xl font-medium">
                {price.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-sm text-green-700 font-medium mt-2">
              FREE delivery
            </p>

            <p className="text-sm mt-3">
              {stock > 0 ? (
                <span className="text-green-700 font-medium">In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">
                  Out of Stock
                </span>
              )}
            </p>

            {stock > 0 && (
              <>

                <p className="text-xs text-zinc-500 mt-3">
                  {stock} units available
                </p>

                <div className="flex items-center border rounded-md mt-3 w-fit">

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    className="p-2 hover:bg-zinc-100"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-medium">
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
                    className="p-2 hover:bg-zinc-100"
                  >
                    <Plus size={16} />
                  </button>

                </div>

                <button
                  onClick={() =>
                    onAddToCart(
                      product,
                      quantity
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-zinc-900 rounded-full font-medium py-2.5 mt-4 text-sm"
                >
                  <ShoppingCart size={17} />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-zinc-900 rounded-full font-medium py-2.5 mt-2 text-sm"
                >
                  Buy Now
                </button>

              </>
            )}

          </div>
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
