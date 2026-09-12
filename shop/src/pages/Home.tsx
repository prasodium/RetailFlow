import { useEffect, useState } from "react";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import type {
  Product,
} from "../types";

interface HomeProps {
  onAddToCart: (
    product: Product
  ) => void;
}

export default function Home({
  onAddToCart,
}: HomeProps) {

  const [products, setProducts] =
    useState<Product[]>([]);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <div>

      {/* Hero */}

      <section className="bg-zinc-950 text-white">

        <div className="max-w-7xl mx-auto px-6 py-24">

          <div className="max-w-3xl">

            <p className="text-blue-400 font-medium mb-4">
              RETAILFLOW STORE
            </p>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build better.
              <br />
              <span className="text-blue-500">
                Create smarter.
              </span>
            </h1>

            <p className="text-zinc-400 text-lg mt-6 max-w-xl">
              Quality development boards, electronics
              and components for your next project.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
            >
              Shop Products
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

      {/* Benefits */}

      <section className="border-b">

        <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">

          <div className="flex gap-4">

            <Package className="text-blue-600" />

            <div>
              <h3 className="font-semibold">
                Quality Products
              </h3>

              <p className="text-sm text-zinc-500">
                Reliable electronics for your projects.
              </p>
            </div>

          </div>

          <div className="flex gap-4">

            <Truck className="text-blue-600" />

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

            <ShieldCheck className="text-blue-600" />

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

      {/* Products */}

      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex items-end justify-between mb-8">

          <div>
            <p className="text-blue-600 text-sm font-medium">
              FEATURED
            </p>

            <h2 className="text-3xl font-bold mt-1">
              Popular Products
            </h2>
          </div>

          <Link
            to="/products"
            className="text-sm font-medium text-blue-600 flex items-center gap-1"
          >
            View all
            <ArrowRight size={16} />
          </Link>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {products.slice(0, 6).map(
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

    </div>
  );
}