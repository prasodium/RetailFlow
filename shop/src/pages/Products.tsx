import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX, X } from "lucide-react";

import { getCategories, getPopularProducts, getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import { fuzzyMatch, parseSearchQuery } from "../lib/search";
import { addRecentSearch } from "../lib/recentSearches";
import { track } from "../lib/analytics";
import type {
  Category,
  Product,
} from "../types";

interface ProductsProps {
  onAddToCart: (
    product: Product
  ) => void;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name" | "popularity";

export default function Products({
  onAddToCart,
}: ProductsProps) {

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [popular, setPopular] =
    useState<Product[]>([]);

  const [sort, setSort] = useState<SortOption>("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

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
      getPopularProducts(30),
    ])
      .then(([productsData, categoriesData, popularData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setPopular(popularData);
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

  function clearAllFilters() {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSearchParams(new URLSearchParams());
  }

  // Rule-based natural-language parsing (no LLM): pulls a price range +
  // category out of the free-text query, e.g. "shoes under 3000".
  const parsed = useMemo(
    () => parseSearchQuery(search, categories),
    [search, categories]
  );

  const effectiveMinPrice = minPrice !== "" ? Number(minPrice) : parsed.minPrice;
  const effectiveMaxPrice = maxPrice !== "" ? Number(maxPrice) : parsed.maxPrice;
  const effectiveCategoryId = categoryId ?? parsed.categoryId ?? null;

  const popularityRank = useMemo(() => {
    const map = new Map<number, number>();
    popular.forEach((p, index) => map.set(p.id, index));
    return map;
  }, [popular]);

  const filteredProducts = useMemo(() => {
    const queryText = parsed.text;

    const filtered = products.filter((product) => {
      const matchesSearch =
        !queryText ||
        fuzzyMatch(product.name, queryText) ||
        fuzzyMatch(product.sku, queryText) ||
        fuzzyMatch(product.category.name, queryText);

      const matchesCategory =
        effectiveCategoryId === null ||
        product.categoryId === effectiveCategoryId;

      const price = Number(product.price);

      const matchesMinPrice =
        effectiveMinPrice === undefined || price >= effectiveMinPrice;

      const matchesMaxPrice =
        effectiveMaxPrice === undefined || price <= effectiveMaxPrice;

      const matchesStock =
        !inStockOnly || (product.inventory?.quantity ?? 0) > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesStock
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
      case "popularity":
        return [...filtered].sort(
          (a, b) =>
            (popularityRank.get(a.id) ?? Infinity) -
            (popularityRank.get(b.id) ?? Infinity)
        );
      default:
        return filtered;
    }
  }, [
    products,
    parsed,
    effectiveCategoryId,
    effectiveMinPrice,
    effectiveMaxPrice,
    inStockOnly,
    sort,
    popularityRank,
  ]);

  // --- Analytics: search_performed (debounced on the raw query) ---
  const filteredCountRef = useRef(filteredProducts.length);

  useEffect(() => {
    filteredCountRef.current = filteredProducts.length;
  }, [filteredProducts.length]);

  useEffect(() => {
    const trimmed = search.trim();

    if (!trimmed) return;

    const timer = setTimeout(() => {
      addRecentSearch(trimmed);

      track("search_performed", {
        metadata: {
          query: trimmed,
          resultCount: filteredCountRef.current,
        },
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [search]);

  // --- Analytics: product_filtered / product_sorted (skip first render) ---
  const isFirstFilterRender = useRef(true);

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }

    track("product_filtered", {
      metadata: {
        categoryId: effectiveCategoryId,
        minPrice: effectiveMinPrice ?? null,
        maxPrice: effectiveMaxPrice ?? null,
        inStockOnly,
      },
    });
  }, [effectiveCategoryId, effectiveMinPrice, effectiveMaxPrice, inStockOnly]);

  const isFirstSortRender = useRef(true);

  useEffect(() => {
    if (isFirstSortRender.current) {
      isFirstSortRender.current = false;
      return;
    }

    track("product_sorted", { metadata: { sort } });
  }, [sort]);

  const activeCategory = categories.find((c) => c.id === effectiveCategoryId);
  const hasActiveFilters =
    Boolean(search) || categoryId !== null || minPrice !== "" || maxPrice !== "" || inStockOnly;

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
                  categoryId === null && !parsed.categoryId
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
                    effectiveCategoryId === category.id
                      ? "font-semibold text-[#c7511f]"
                      : "text-zinc-600 hover:text-[#c7511f]"
                  }`}
                >
                  {category.name}
                </button>
              ))}

            </div>
          </div>

          <div>
            <h2 className="font-semibold text-sm mb-3">
              Price
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-zinc-300 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#febd69]"
              />

              <span className="text-zinc-400">–</span>

              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-zinc-300 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#febd69]"
              />
            </div>

            {(parsed.minPrice !== undefined || parsed.maxPrice !== undefined) &&
              minPrice === "" &&
              maxPrice === "" && (
                <p className="text-xs text-zinc-400 mt-1.5">
                  Detected from your search
                </p>
              )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-zinc-300"
              />
              In Stock Only
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-sm text-[#007185] hover:underline"
            >
              <X size={14} />
              Clear all filters
            </button>
          )}

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
                placeholder="Search products... (try 'shoes under 2000')"
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
              <option value="popularity">Popularity</option>
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

            <div>

              <div className="py-16 text-center border border-dashed border-zinc-300 rounded-lg">
                <SearchX size={40} className="mx-auto text-zinc-300" />

                <h3 className="font-semibold mt-4">
                  No products found{search ? ` for "${search}"` : ""}
                </h3>

                <p className="text-sm text-zinc-500 mt-1">
                  Try removing a filter or check the spelling.
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-block mt-5 px-5 py-2.5 bg-[#febd69] hover:bg-[#f3a847] text-zinc-900 rounded-md text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {popular.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-semibold mb-4">
                    Popular products you might like
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {popular.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

          ) : (

            <div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              onClick={(e) => {
                if (!search.trim()) return;

                const link = (e.target as HTMLElement).closest("a");
                const match = link?.getAttribute("href")?.match(/\/products\/(\d+)/);

                if (match) {
                  track("search_result_clicked", {
                    productId: Number(match[1]),
                    metadata: { query: search.trim() },
                  });
                }
              }}
            >

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
