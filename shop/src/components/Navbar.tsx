import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Search,
} from "lucide-react";

interface NavbarProps {
  cartCount: number;
}

export default function Navbar({
  cartCount,
}: NavbarProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link
          to="/"
          className="text-xl font-bold tracking-tight"
        >
          Retail<span className="text-blue-600">
            Flow
          </span>
          <span className="text-zinc-400 text-sm font-normal ml-2">
            Store
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">

          <Link
            to="/"
            className="text-zinc-600 hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-zinc-600 hover:text-blue-600"
          >
            Products
          </Link>

        </nav>

        <div className="flex items-center gap-4">

          <button className="hidden sm:flex items-center gap-2 border rounded-lg px-3 py-2 text-zinc-400">
            <Search size={17} />
            <span className="text-sm">
              Search
            </span>
          </button>

          <Link
            to="/cart"
            className="relative p-2 hover:bg-zinc-100 rounded-lg"
          >
            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </div>

      </div>

    </header>
  );
}