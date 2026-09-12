import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { getCategories, getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import type {
  Category,
  Product,
} from "../types";

interface ProductsProps {
  onAddToCart: (
    product: Product
  ) => void;
}

export default function Products({
  onAddToCart,
}: ProductsProps) {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  const [categoryId, setCategoryId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getCategories(),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    products.filter((product) => {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.sku
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        categoryId === null ||
        product.categoryId === categoryId;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <div className="mb-10">

        <p className="text-blue-600 text-sm font-medium">
          SHOP
        </p>

        <h1 className="text-4xl font-bold mt-1">
          All Products
        </h1>

        <p className="text-zinc-500 mt-2">
          Browse our available products.
        </p>

      </div>

      {/* Filters */}

      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
            className="w-full border border-zinc-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <select
          value={categoryId ?? ""}
          onChange={(e) =>
            setCategoryId(
              e.target.value
                ? Number(e.target.value)
                : null
            )
          }
          className="border border-zinc-300 rounded-xl px-4 py-3 bg-white"
        >
          <option value="">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}

        </select>

      </div>

      {loading ? (

        <div className="py-20 text-center text-zinc-500">
          Loading products...
        </div>

      ) : filteredProducts.length === 0 ? (

        <div className="py-20 text-center text-zinc-500">
          No products found.
        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            )
          )}

        </div>

      )}

    </div>
  );
}