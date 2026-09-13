import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  MapPin,
  Menu,
  Clock,
  Tag,
} from "lucide-react";
import { useShopAuth } from "../context/ShopAuthContext";
import { getCategories, getProducts } from "../api";
import { fuzzyMatch } from "../lib/search";
import {
  addRecentSearch,
  getRecentSearches,
} from "../lib/recentSearches";
import type { Category, Product } from "../types";

interface NavbarProps {
  cartCount: number;
}

type Suggestion =
  | { type: "product"; key: string; product: Product }
  | { type: "category"; key: string; category: Category }
  | { type: "recent"; key: string; query: string };

export default function Navbar({
  cartCount,
}: NavbarProps) {
  const { customer } = useShopAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = search.trim();

    if (!query) {
      return recentSearches.map((q) => ({
        type: "recent" as const,
        key: `recent-${q}`,
        query: q,
      }));
    }

    const matchedProducts = products
      .filter((p) => fuzzyMatch(p.name, query))
      .slice(0, 5)
      .map((product) => ({
        type: "product" as const,
        key: `product-${product.id}`,
        product,
      }));

    const matchedCategories = categories
      .filter((c) => fuzzyMatch(c.name, query))
      .slice(0, 3)
      .map((category) => ({
        type: "category" as const,
        key: `category-${category.id}`,
        category,
      }));

    return [...matchedCategories, ...matchedProducts];
  }, [search, products, categories, recentSearches]);

  function openDropdown() {
    setRecentSearches(getRecentSearches());
    setIsOpen(true);
  }

  function goToSearch(query: string) {
    const trimmed = query.trim();

    addRecentSearch(trimmed);
    setIsOpen(false);
    setSearch(trimmed);

    navigate(
      trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products"
    );
  }

  function selectSuggestion(suggestion: Suggestion) {
    setIsOpen(false);

    if (suggestion.type === "product") {
      addRecentSearch(search);
      navigate(`/products/${suggestion.product.id}`);
    } else if (suggestion.type === "category") {
      setSearch("");
      navigate(`/products?category=${suggestion.category.id}`);
    } else {
      goToSearch(suggestion.query);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (highlightIndex >= 0 && suggestions[highlightIndex]) {
      selectSuggestion(suggestions[highlightIndex]);
      return;
    }

    goToSearch(search);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50">

      {/* Top bar */}

      <div className="bg-[#131921] text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

          <Link
            to="/"
            className="text-xl font-bold tracking-tight shrink-0 border border-transparent hover:border-white rounded px-2 py-1"
          >
            Retail<span className="text-[#ff9900]">Flow</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-xs shrink-0 border border-transparent hover:border-white rounded px-2 py-1 cursor-pointer">
            <MapPin size={18} className="text-zinc-300" />
            <div>
              <p className="text-zinc-300 leading-tight">Deliver to</p>
              <p className="font-semibold leading-tight">India</p>
            </div>
          </div>

          <div ref={wrapperRef} className="relative flex-1 max-w-2xl">
            <form
              onSubmit={handleSearch}
              className="flex items-stretch rounded-md overflow-hidden ring-2 ring-transparent focus-within:ring-[#febd69]"
            >
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightIndex(-1);
                  setIsOpen(true);
                }}
                onFocus={openDropdown}
                onKeyDown={handleKeyDown}
                placeholder="Search RetailFlow Store"
                autoComplete="off"
                className="flex-1 min-w-0 px-4 py-2.5 bg-white text-sm text-zinc-900 placeholder:text-zinc-500 outline-none"
              />

              <button
                type="submit"
                aria-label="Search"
                className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center"
              >
                <Search size={18} className="text-zinc-900" />
              </button>
            </form>

            {isOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white text-zinc-900 rounded-md shadow-xl border border-zinc-200 overflow-hidden z-50">
                {search.trim() === "" && (
                  <p className="px-4 pt-2.5 pb-1 text-xs font-semibold text-zinc-400 uppercase">
                    Recent Searches
                  </p>
                )}

                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.key}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left ${
                      index === highlightIndex ? "bg-zinc-100" : ""
                    }`}
                  >
                    {suggestion.type === "product" && (
                      <>
                        <Search size={15} className="text-zinc-400 shrink-0" />
                        <span className="flex-1 truncate">
                          {suggestion.product.name}
                        </span>
                        <span className="text-xs text-zinc-400">
                          in {suggestion.product.category.name}
                        </span>
                      </>
                    )}

                    {suggestion.type === "category" && (
                      <>
                        <Tag size={15} className="text-zinc-400 shrink-0" />
                        <span className="flex-1 truncate">
                          {suggestion.category.name}
                        </span>
                        <span className="text-xs text-zinc-400">Category</span>
                      </>
                    )}

                    {suggestion.type === "recent" && (
                      <>
                        <Clock size={15} className="text-zinc-400 shrink-0" />
                        <span className="flex-1 truncate">
                          {suggestion.query}
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            to={customer ? "/account" : "/login"}
            className="hidden sm:flex flex-col text-xs shrink-0 border border-transparent hover:border-white rounded px-2 py-1"
          >
            <span className="text-zinc-300">
              {customer ? `Hello, ${customer.name.split(" ")[0]}` : "Hello, sign in"}
            </span>
            <span className="font-semibold">Account &amp; Lists</span>
          </Link>

          <Link
            to={customer ? "/account" : "/login"}
            className="sm:hidden p-2 border border-transparent hover:border-white rounded"
          >
            <User size={22} />
          </Link>

          <Link
            to="/cart"
            className="relative flex items-end gap-1 shrink-0 border border-transparent hover:border-white rounded px-2 py-1"
          >
            <ShoppingCart size={28} />
            <span className="absolute -top-1 left-4 w-5 h-5 rounded-full bg-[#ff9900] text-zinc-900 text-xs font-bold flex items-center justify-center">
              {cartCount}
            </span>
            <span className="hidden md:inline text-sm font-semibold pb-0.5">
              Cart
            </span>
          </Link>

        </div>
      </div>

      {/* Category strip */}

      <div className="bg-[#232f3e] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-5 overflow-x-auto">

          <Link
            to="/products"
            className="flex items-center gap-1.5 font-semibold shrink-0 hover:text-zinc-300"
          >
            <Menu size={16} />
            All
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="shrink-0 hover:text-zinc-300 whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}

        </div>
      </div>

    </header>
  );
}
