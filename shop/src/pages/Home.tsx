import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getCategories, getHomeRecommendations, getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import RecommendedProducts from "../components/RecommendedProducts";
import type {
  Category,
  Product,
} from "../types";

interface HomeProps {
  onAddToCart: (
    product: Product,
    quantity?: number
  ) => void;
}

export default function Home({
  onAddToCart,
}: HomeProps) {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [recommended, setRecommended] =
    useState<Product[]>([]);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error);

    getCategories()
      .then(setCategories)
      .catch(console.error);

    getHomeRecommendations()
      .then(setRecommended)
      .catch(console.error);
  }, []);

  const productsByCategory = useMemo(() => {
    const map = new Map<number, Product[]>();

    for (const product of products) {
      const list = map.get(product.categoryId) ?? [];
      list.push(product);
      map.set(product.categoryId, list);
    }

    return map;
  }, [products]);

  return (
    <div>

      {/* Hero */}

      <section className="bg-zinc-950 text-white">

        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="max-w-3xl">

            <p className="text-[#ff9900] font-medium mb-4">
              RETAILFLOW STORE
            </p>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Everything you need.
              <br />
              <span className="text-[#febd69]">
                Delivered to you.
              </span>
            </h1>

            <p className="text-zinc-400 text-lg mt-6 max-w-xl">
              Electronics, fashion, home essentials, books, and more —
              all in one place.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-8 bg-[#febd69] hover:bg-[#f3a847] text-zinc-900 px-6 py-3 rounded-md font-semibold"
            >
              Shop All Products
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

      {/* Benefits */}

      <section className="border-b bg-white">

        <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">

          <div className="flex gap-4">

            <Package className="text-[#c7511f]" />

            <div>
              <h3 className="font-semibold">
                Wide Selection
              </h3>

              <p className="text-sm text-zinc-500">
                Thousands of products across every category.
              </p>
            </div>

          </div>

          <div className="flex gap-4">

            <Truck className="text-[#c7511f]" />

            <div>
              <h3 className="font-semibold">
                Fast Delivery
              </h3>

              <p className="text-sm text-zinc-500">
                Get your products delivered quickly.
              </p>
            </div>

          </div>

          <div className="flex gap-4">

            <ShieldCheck className="text-[#c7511f]" />

            <div>
              <h3 className="font-semibold">
                Secure Checkout
              </h3>

              <p className="text-sm text-zinc-500">
                Safe and reliable ordering.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Shop by category */}

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">

          <h2 className="text-2xl font-bold mb-6">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">

            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="bg-white border border-zinc-200 rounded-lg p-5 hover:shadow-md transition text-center"
              >
                <p className="font-semibold text-sm">
                  {category.name}
                </p>

                <p className="text-xs text-[#007185] mt-2">
                  Shop now
                </p>
              </Link>
            ))}

          </div>

        </section>
      )}

      {/* Recommended for you */}

      <section className="max-w-7xl mx-auto px-6 pb-4">
        <RecommendedProducts
          title="Recommended for You"
          products={recommended}
          onAddToCart={onAddToCart}
        />
      </section>

      {/* Product rows by category */}

      {categories.map((category) => {
        const items = productsByCategory.get(category.id) ?? [];

        if (items.length === 0) {
          return null;
        }

        return (
          <section
            key={category.id}
            className="max-w-7xl mx-auto px-6 py-8"
          >

            <div className="flex items-end justify-between mb-5">

              <h2 className="text-xl font-bold">
                {category.name}
              </h2>

              <Link
                to={`/products?category=${category.id}`}
                className="text-sm font-medium text-[#007185] flex items-center gap-1"
              >
                See more
                <ArrowRight size={14} />
              </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {items.slice(0, 4).map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                  />
                )
              )}

            </div>

          </section>
        );
      })}

    </div>
  );
}
