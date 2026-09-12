import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import {
  getOnlineOrders,
  updateOrderStatus,
} from "../services/onlineOrderService";
import type { Sale, OrderStatus } from "../types";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

const CANCELLABLE: OrderStatus[] = ["PENDING", "CONFIRMED", "PACKED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OnlineOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const data = await getOnlineOrders();

      setOrders(data);
    } catch (error) {
      console.error("Failed to load online orders", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvance(order: Sale) {
    const current = order.orderStatus ?? "PENDING";
    const next = NEXT_STATUS[current];

    if (!next) return;

    try {
      setUpdatingId(order.id);

      await updateOrderStatus(order.id, next);

      await loadOrders();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancel(order: Sale) {
    const confirmed = window.confirm(
      `Cancel order ${order.invoiceNumber}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(order.id);

      await updateOrderStatus(order.id, "CANCELLED");

      await loadOrders();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Failed to cancel order"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return <div className="p-6">Loading online orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Online Orders
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Orders placed through the customer storefront.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck size={22} />
            </div>

            <h3 className="font-semibold mt-4">No online orders yet</h3>

            <p className="text-sm text-zinc-500 mt-1">
              Orders placed from the storefront will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="text-left px-5 py-4">Invoice</th>
                  <th className="text-left px-5 py-4">Customer</th>
                  <th className="text-left px-5 py-4">Date</th>
                  <th className="text-left px-5 py-4">Items</th>
                  <th className="text-right px-5 py-4">Total</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-right px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const status = order.orderStatus ?? "PENDING";
                  const next = NEXT_STATUS[status];
                  const canCancel = CANCELLABLE.includes(status);
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-zinc-50"
                    >
                      <td className="px-5 py-4 font-medium">
                        <button
                          onClick={() => navigate(`/sales/${order.id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          {order.invoiceNumber}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {order.customer?.name ?? "Guest"}
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        {order.items.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold">
                        ₹{Number(order.total).toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[status]}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {next && (
                            <button
                              onClick={() => handleAdvance(order)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 border rounded-lg hover:bg-zinc-100 disabled:opacity-50"
                            >
                              Mark {next}
                            </button>
                          )}

                          {canCancel && (
                            <button
                              onClick={() => handleCancel(order)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
