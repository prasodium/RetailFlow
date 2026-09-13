import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, LogOut } from "lucide-react";
import { getMyOrders } from "../api";
import { useShopAuth } from "../context/ShopAuthContext";
import type { Order } from "../types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function Account() {
  const { customer, logout } = useShopAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>

          <p className="text-zinc-500 mt-2">
            {customer?.name} — {customer?.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-zinc-50"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-10">Order History</h2>

      {loading ? (
        <div className="py-16 text-center text-zinc-500">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 text-[#c7511f] flex items-center justify-center">
            <Package size={22} />
          </div>

          <h3 className="font-semibold mt-4">No orders yet</h3>

          <Link
            to="/products"
            className="inline-block mt-5 px-5 py-2.5 bg-[#ffa41c] text-zinc-900 rounded-xl"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block bg-white border rounded-2xl p-5 hover:border-blue-400 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{order.invoiceNumber}</p>

                  <p className="text-sm text-zinc-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    ₹{Number(order.total).toFixed(2)}
                  </p>

                  <span
                    className={`inline-block mt-1 px-2.5 py-1 text-xs rounded-full font-medium ${
                      STATUS_STYLES[order.orderStatus ?? "PENDING"]
                    }`}
                  >
                    {order.orderStatus ?? "PENDING"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
