import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16">

      <Link
        to="/"
        className="block bg-[#37475a] hover:bg-[#485769] text-white text-center py-4 text-sm"
      >
        Back to top
      </Link>

      <div className="bg-[#232f3e] text-zinc-300">

        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">

          <div>
            <h3 className="text-white font-semibold mb-3">Get to Know Us</h3>
            <ul className="space-y-2">
              <li>About RetailFlow</li>
              <li>Careers</li>
              <li>Press Releases</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Connect with Us</h3>
            <ul className="space-y-2">
              <li>Facebook</li>
              <li>Twitter</li>
              <li>Instagram</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Let Us Help You</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/account" className="hover:underline">
                  Your Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:underline">
                  Your Cart
                </Link>
              </li>
              <li>Help Center</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">RetailFlow</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:underline">
                  All Products
                </Link>
              </li>
              <li>Shipping Info</li>
              <li>Returns</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-zinc-700 py-5 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} RetailFlow Store. All rights reserved.
        </div>

      </div>

    </footer>
  );
}
