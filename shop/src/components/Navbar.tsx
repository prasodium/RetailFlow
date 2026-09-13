import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  MapPin,
  Menu,
} from "lucide-react";
import { useShopAuth } from "../context/ShopAuthContext";
import { getCategories } from "../api";
import type { Category } from "../types";

interface NavbarProps {
  cartCount: number;
}

export default function Navbar({
  cartCount,
}: NavbarProps) {
  const { customer } = useShopAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    navigate(
      search.trim()
        ? `/products?q=${encodeURIComponent(search.trim())}`
        : "/products"
    );
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

          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-stretch rounded-md overflow-hidden max-w-2xl ring-2 ring-transparent focus-within:ring-[#febd69]"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search RetailFlow Store"
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
