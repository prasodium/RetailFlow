import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

type SortOption = "featured" | "price-asc" | "price-desc" | "name";

export default function Products({
  onAddToCart,
}: ProductsProps) {

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [sort, setSort] = useState<SortOption>("featured");

  const [loading, setLoading] =
    useState(true);

  // The URL is the single source of truth for search/category, so
  // navigating here from a category tile or the navbar search "just
  // works" without a sync effect.
  const search = searchParams.get("q") ?? "";

  const categoryId = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : null;

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

  function updateSearch(value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }

    setSearchParams(next, { replace: true });
  }

  function selectCategory(id: number | null) {
    const next = new URLSearchParams(searchParams);

    if (id === null) {
      next.delete("category");
    } else {
      next.set("category", String(id));
    }

    setSearchParams(next);
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(query) ||
        product.sku
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryId === null ||
        product.categoryId === categoryId;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

    switch (sort) {
      case "price-asc":
        return [...filtered].sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
      case "price-desc":
        return [...filtered].sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
      case "name":
        return [...filtered].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      default:
        return filtered;
    }
  }, [products, search, categoryId, sort]);

  const activeCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="mb-6">

        <h1 className="text-2xl font-bold">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>

        <p className="text-zinc-500 mt-1 text-sm">
          {filteredProducts.length} results
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">

        {/* Sidebar */}

        <aside className="space-y-6">

          <div>
            <h2 className="font-semibold text-sm mb-3">
              Category
            </h2>

            <div className="space-y-2 text-sm">

              <button
                onClick={() => selectCategory(null)}
                className={`block text-left ${
                  categoryId === null
                    ? "font-semibold text-[#c7511f]"
                    : "text-zinc-600 hover:text-[#c7511f]"
                }`}
              >
                All Categories
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={`block text-left ${
                    categoryId === category.id
                      ? "font-semibold text-[#c7511f]"
                      : "text-zinc-600 hover:text-[#c7511f]"
                  }`}
                >
                  {category.name}
                </button>
              ))}

            </div>
          </div>

        </aside>

        {/* Results */}

        <div>

          {/* Filters */}

          <div className="flex flex-col md:flex-row gap-4 mb-6">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  updateSearch(e.target.value)
                }
                placeholder="Search products..."
                className="w-full border border-zinc-300 rounded-md pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#febd69]"
              />

            </div>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as SortOption)
              }
              className="border border-zinc-300 rounded-md px-4 py-2.5 bg-white text-sm"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

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

      </div>

    </div>
  );
}
