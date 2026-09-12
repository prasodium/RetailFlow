import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { getOrder } from "../api";
import type { Order, OrderStatus } from "../types";

const STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getOrder(Number(id))
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        Order not found.
      </div>
    );
  }

  const status = order.orderStatus ?? "PENDING";
  const isCancelled = status === "CANCELLED";
  const currentStepIndex = STEPS.indexOf(status);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        to="/account"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 mb-8"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.invoiceNumber}</h1>

          <p className="text-zinc-500 mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <p className="text-2xl font-bold">
          ₹{Number(order.total).toFixed(2)}
        </p>
      </div>

      {/* Status tracker */}

      <div className="bg-white border rounded-2xl p-6 mt-8">
        {isCancelled ? (
          <p className="text-red-600 font-semibold">
            This order was cancelled.
          </p>
        ) : (
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const reached = index <= currentStepIndex;

              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        reached
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {reached ? <Check size={16} /> : index + 1}
                    </div>

                    <p
                      className={`text-xs mt-2 text-center ${
                        reached ? "text-blue-600 font-medium" : "text-zinc-400"
                      }`}
                    >
                      {step}
                    </p>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 -mt-5 ${
                        index < currentStepIndex
                          ? "bg-blue-600"
                          : "bg-zinc-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items */}

      <div className="bg-white border rounded-2xl p-6 mt-6">
        <h2 className="font-semibold mb-4">Items</h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium text-sm">{item.product.name}</p>
                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
              </div>

              <p className="font-medium text-sm">
                ₹{Number(item.subtotal).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-white border rounded-2xl p-6 mt-6">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <p className="text-zinc-600">{order.shippingAddress}</p>
        </div>
      )}
    </div>
  );
}
